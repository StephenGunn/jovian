import type * as Party from "partykit/server";
import type { Message } from "../src/lib/types/multiplayer";

type AlienData = {
  country: string;
};

const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const SWEEP_INTERVAL_MS = 60 * 1000; // Check every minute

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) { }

  // Enable hibernation by implementing getConnectionTags
  async getConnectionTags(
    connection: Party.Connection,
    ctx: Party.ConnectionContext
  ): Promise<string[]> {
    // Tag each connection with their ID for targeted messaging
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

    // Get all last-activity timestamps
    const activityEntries = await this.room.storage.list<number>({ prefix: "activity:" });
    const entityEntries = await this.room.storage.list<AlienData>({ prefix });

    // Build set of active connection IDs
    const activeConnIds = new Set<string>();
    for (const conn of this.room.getConnections()) {
      activeConnIds.add(conn.id);
    }

    // Find and remove idle or orphaned entries
    for (const [key, data] of entityEntries) {
      const connId = key.replace(prefix, "");
      const lastActivity = activityEntries.get(`activity:${connId}`);
      const isIdle = !lastActivity || (now - lastActivity) > IDLE_TIMEOUT_MS;
      const isOrphaned = !activeConnIds.has(connId);

      if (isIdle || isOrphaned) {
        await this.room.storage.delete(key);
        await this.room.storage.delete(`activity:${connId}`);

        // Close the connection if it's still open
        for (const conn of this.room.getConnections()) {
          if (conn.id === connId) {
            conn.close();
            break;
          }
        }

        // Notify remaining clients
        this.room.broadcast(
          JSON.stringify({
            type: "remove",
            [isTankRoom ? "fishId" : "alienId"]: connId
          })
        );

        console.log(`Swept idle connection ${connId} from room ${this.room.id}`);
      }
    }

    // Reschedule if there are still connections
    if (entityEntries.size > 0) {
      await this.room.storage.setAlarm(Date.now() + SWEEP_INTERVAL_MS);
    }
  }

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // Store country code in room storage for persistence
    const alien: AlienData = {
      country: this.get_valid_country_code(ctx.request)
    };
    await this.room.storage.put(`alien:${conn.id}`, alien);
    await this.room.storage.put(`activity:${conn.id}`, Date.now());
    await this.ensureSweepAlarm();

    // Get all current aliens from storage
    const alienEntries = await this.room.storage.list<AlienData>({ prefix: "alien:" });
    const currentEntities = Array.from(alienEntries.entries()).map(([key, data]) => ({
      id: key.replace("alien:", ""),
      ...data
    }));

    // Use different message format based on room
    const isTankRoom = this.room.id === "playground-tank";

    conn.send(
      JSON.stringify({
        type: "init",
        [isTankRoom ? "fish" : "aliens"]: currentEntities
      })
    );

    // Broadcast new entity to all other connections
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
        // Homepage - relay waypoint to other clients
        const broadcastMessage = JSON.stringify({
          type: "waypoint",
          alienId: sender.id,
          x: message.x,
          y: message.y
        });
        this.room.broadcast(broadcastMessage, [sender.id]);
      } else if (message.type === "fish_move") {
        // Fish tank - relay fish movement to other clients
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
    // Remove alien and activity tracking from storage
    await this.room.storage.delete(`alien:${conn.id}`);
    await this.room.storage.delete(`activity:${conn.id}`);

    // Use different message format based on room
    const isTankRoom = this.room.id === "playground-tank";

    // Notify other clients about the disconnection
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

    // Flush all stored entities and kick active connections (they'll auto-reconnect)
    if (url.pathname.endsWith("/flush") && req.method === "POST") {
      const isTankRoom = this.room.id === "playground-tank";
      const prefix = isTankRoom ? "fish:" : "alien:";
      const entries = await this.room.storage.list({ prefix });
      const activityEntries = await this.room.storage.list({ prefix: "activity:" });
      await this.room.storage.delete([...entries.keys(), ...activityEntries.keys()]);

      // Kick all active connections - they'll reconnect fresh
      let kicked = 0;
      for (const conn of this.room.getConnections()) {
        conn.close();
        kicked++;
      }

      return new Response(`Flushed ${entries.size} stored, kicked ${kicked} active`, { status: 200 });
    }

    return new Response("Not found", { status: 404 });
  }
}

Server satisfies Party.Worker;
