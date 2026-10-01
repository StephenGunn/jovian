import type * as Party from "partykit/server";
import type { Message } from "../src/lib/types/multiplayer";

type AlienData = {
  country: string;
};

type GhostWaypoint = {
  x: number;
  y: number;
  dt: number;
};

type GhostFlight = {
  id: string;
  country: string;
  waypoints: GhostWaypoint[];
};

const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const SWEEP_INTERVAL_MS = 60 * 1000; // Check every minute
const MAX_GHOST_COUNT = 3;
const MAX_REPLAY_DURATION_MS = 120_000; // Compress flights to 2 min max
const MIN_WAYPOINTS = 3; // Don't replay flights with fewer waypoints

export default class Server implements Party.Server {
  private sqlInitialized = false;

  constructor(readonly room: Party.Room) {}

  private initSql() {
    if (this.sqlInitialized) return;
    if (this.room.id !== "space") {
      this.sqlInitialized = true;
      return;
    }

    this.room.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS flights (
        conn_id TEXT PRIMARY KEY,
        country TEXT NOT NULL,
        started_at INTEGER NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0
      )
    `);

    this.room.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS waypoints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conn_id TEXT NOT NULL,
        x REAL NOT NULL,
        y REAL NOT NULL,
        dt INTEGER NOT NULL
      )
    `);

    // Prune old flights (keep last 30 days)
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    this.room.storage.sql.exec(
      `DELETE FROM waypoints WHERE conn_id IN (SELECT conn_id FROM flights WHERE started_at < ?)`,
      cutoff
    );
    this.room.storage.sql.exec(
      `DELETE FROM flights WHERE started_at < ?`,
      cutoff
    );

    this.sqlInitialized = true;
  }

  private getGhostFlights(excludeConnId: string): GhostFlight[] {
    this.initSql();
    if (this.room.id !== "space") return [];

    // Count real connections to decide how many ghosts
    let realCount = 0;
    for (const _ of this.room.getConnections()) {
      realCount++;
    }

    const ghostsNeeded = Math.max(0, MAX_GHOST_COUNT - realCount + 1);
    if (ghostsNeeded === 0) return [];

    // Pick random completed flights with enough waypoints
    const flights = this.room.storage.sql.exec(
      `SELECT f.conn_id, f.country, COUNT(w.id) as wp_count
       FROM flights f
       JOIN waypoints w ON w.conn_id = f.conn_id
       WHERE f.completed = 1
       GROUP BY f.conn_id
       HAVING wp_count >= ?
       ORDER BY RANDOM()
       LIMIT ?`,
      MIN_WAYPOINTS,
      ghostsNeeded
    ).toArray() as { conn_id: string; country: string; wp_count: number }[];

    return flights.map((f) => {
      const wps = this.room.storage.sql.exec(
        `SELECT x, y, dt FROM waypoints WHERE conn_id = ? ORDER BY dt ASC`,
        f.conn_id
      ).toArray() as { x: number; y: number; dt: number }[];

      // Time-compress if the flight was longer than MAX_REPLAY_DURATION_MS
      const totalDuration = wps[wps.length - 1]?.dt ?? 0;
      const scale = totalDuration > MAX_REPLAY_DURATION_MS
        ? MAX_REPLAY_DURATION_MS / totalDuration
        : 1;

      return {
        id: `ghost-${f.conn_id}`,
        country: f.country,
        waypoints: wps.map((wp) => ({
          x: wp.x,
          y: wp.y,
          dt: Math.round(wp.dt * scale)
        }))
      };
    });
  }

  // Enable hibernation by implementing getConnectionTags
  async getConnectionTags(
    connection: Party.Connection,
    ctx: Party.ConnectionContext
  ): Promise<string[]> {
    return [connection.id];
  }

  get_valid_country_code(request: Party.Request) {
    const countryCode = request.cf?.country;
    if (!countryCode) return "UNKNOWN";
    if (
      typeof countryCode === "string" &&
      countryCode.length === 2 &&
      /^[A-Z]{2}$/.test(countryCode)
    ) {
      return countryCode;
    }
    return "UNKNOWN";
  }

  async ensureSweepAlarm() {
    const alarm = await this.room.storage.getAlarm();
    if (!alarm) {
      await this.room.storage.setAlarm(Date.now() + SWEEP_INTERVAL_MS);
    }
  }

  async onAlarm() {
    const now = Date.now();
    const isTankRoom = this.room.id === "playground-tank";
    const prefix = isTankRoom ? "fish:" : "alien:";

    const activityEntries = await this.room.storage.list<number>({ prefix: "activity:" });
    const entityEntries = await this.room.storage.list<AlienData>({ prefix });

    const activeConnIds = new Set<string>();
    for (const conn of this.room.getConnections()) {
      activeConnIds.add(conn.id);
    }

    for (const [key, data] of entityEntries) {
      const connId = key.replace(prefix, "");
      const lastActivity = activityEntries.get(`activity:${connId}`);
      const isIdle = !lastActivity || (now - lastActivity) > IDLE_TIMEOUT_MS;
      const isOrphaned = !activeConnIds.has(connId);

      if (isIdle || isOrphaned) {
        await this.room.storage.delete(key);
        await this.room.storage.delete(`activity:${connId}`);

        for (const conn of this.room.getConnections()) {
          if (conn.id === connId) {
            conn.close();
            break;
          }
        }

        this.room.broadcast(
          JSON.stringify({
            type: "remove",
            [isTankRoom ? "fishId" : "alienId"]: connId
          })
        );

        console.log(`Swept idle connection ${connId} from room ${this.room.id}`);
      }
    }

    if (entityEntries.size > 0) {
      await this.room.storage.setAlarm(Date.now() + SWEEP_INTERVAL_MS);
    }
  }

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    const alien: AlienData = {
      country: this.get_valid_country_code(ctx.request)
    };
    await this.room.storage.put(`alien:${conn.id}`, alien);
    await this.room.storage.put(`activity:${conn.id}`, Date.now());
    await this.ensureSweepAlarm();

    const isTankRoom = this.room.id === "playground-tank";

    // Record flight in SQLite (space room only)
    if (!isTankRoom) {
      this.initSql();
      this.room.storage.sql.exec(
        `INSERT OR REPLACE INTO flights (conn_id, country, started_at, completed) VALUES (?, ?, ?, 0)`,
        conn.id,
        alien.country,
        Date.now()
      );
    }

    // Get all current aliens from storage
    const alienEntries = await this.room.storage.list<AlienData>({ prefix: "alien:" });
    const currentEntities = Array.from(alienEntries.entries()).map(([key, data]) => ({
      id: key.replace("alien:", ""),
      ...data
    }));

    // Include ghost flights for the space room
    const ghosts = !isTankRoom ? this.getGhostFlights(conn.id) : [];

    conn.send(
      JSON.stringify({
        type: "init",
        [isTankRoom ? "fish" : "aliens"]: currentEntities,
        ...(ghosts.length > 0 ? { ghosts } : {})
      })
    );

    this.room.broadcast(
      JSON.stringify({
        type: isTankRoom ? "new_fish" : "new_alien",
        id: conn.id,
        country: alien.country
      }),
      [conn.id]
    );

    console.log(`Connection ${conn.id} connected from ${alien.country} to room ${this.room.id}`);
  }

  async onMessage(messageStr: string, sender: Party.Connection) {
    try {
      const message = JSON.parse(messageStr) as any;

      // Track activity for idle sweep
      if (message.type === "ping") {
        await this.room.storage.put(`activity:${sender.id}`, Date.now());
        return;
      }

      await this.room.storage.put(`activity:${sender.id}`, Date.now());

      if (message.type === "waypoint") {
        // Record waypoint in SQLite
        this.initSql();
        const flight = this.room.storage.sql.exec(
          `SELECT started_at FROM flights WHERE conn_id = ?`,
          sender.id
        ).toArray() as { started_at: number }[];

        if (flight.length > 0) {
          const dt = Date.now() - flight[0].started_at;
          this.room.storage.sql.exec(
            `INSERT INTO waypoints (conn_id, x, y, dt) VALUES (?, ?, ?, ?)`,
            sender.id,
            message.x,
            message.y,
            dt
          );
        }

        // Relay waypoint to other clients
        const broadcastMessage = JSON.stringify({
          type: "waypoint",
          alienId: sender.id,
          x: message.x,
          y: message.y
        });
        this.room.broadcast(broadcastMessage, [sender.id]);
      } else if (message.type === "fish_move") {
        const broadcastMessage = JSON.stringify({
          type: "fish_move",
          fishId: sender.id,
          x: message.x,
          y: message.y
        });
        this.room.broadcast(broadcastMessage, [sender.id]);
      }
    } catch (e) {
      console.error("Error processing message:", e);
    }
  }

  async onClose(conn: Party.Connection) {
    await this.room.storage.delete(`alien:${conn.id}`);
    await this.room.storage.delete(`activity:${conn.id}`);

    const isTankRoom = this.room.id === "playground-tank";

    // Mark flight as completed (space room only)
    if (!isTankRoom) {
      this.initSql();
      this.room.storage.sql.exec(
        `UPDATE flights SET completed = 1 WHERE conn_id = ?`,
        conn.id
      );
    }

    this.room.broadcast(
      JSON.stringify({
        type: "remove",
        [isTankRoom ? "fishId" : "alienId"]: conn.id
      }),
      [conn.id]
    );

    console.log(`Connection ${conn.id} disconnected from room ${this.room.id}`);
  }

  async onRequest(req: Party.Request) {
    const url = new URL(req.url);

    if (url.pathname.endsWith("/flush") && req.method === "POST") {
      const isTankRoom = this.room.id === "playground-tank";
      const prefix = isTankRoom ? "fish:" : "alien:";
      const entries = await this.room.storage.list({ prefix });
      const activityEntries = await this.room.storage.list({ prefix: "activity:" });
      await this.room.storage.delete([...entries.keys(), ...activityEntries.keys()]);

      let kicked = 0;
      for (const conn of this.room.getConnections()) {
        conn.close();
        kicked++;
      }

      return new Response(`Flushed ${entries.size} stored, kicked ${kicked} active`, { status: 200 });
    }

    // Stats endpoint - see how many flights are recorded
    if (url.pathname.endsWith("/stats") && req.method === "GET") {
      this.initSql();
      if (this.room.id !== "space") {
        return new Response(JSON.stringify({ room: this.room.id, flights: 0 }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      const stats = this.room.storage.sql.exec(
        `SELECT
          (SELECT COUNT(*) FROM flights) as total_flights,
          (SELECT COUNT(*) FROM flights WHERE completed = 1) as completed_flights,
          (SELECT COUNT(*) FROM waypoints) as total_waypoints`
      ).toArray() as { total_flights: number; completed_flights: number; total_waypoints: number }[];

      return new Response(JSON.stringify({
        room: this.room.id,
        ...stats[0]
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response("Not found", { status: 404 });
  }
}

Server satisfies Party.Worker;
