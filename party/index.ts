import type * as Party from "partykit/server";
import type { Message } from "../src/lib/types/multiplayer";

export default class Server implements Party.Server {
  connections = new Map<string, Party.Connection>();
  aliens = new Map<string, { country: string }>();

  constructor(readonly room: Party.Room) { }

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

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    this.connections.set(conn.id, conn);

    // Store just the country code for this connection
    const alien = {
      country: this.get_valid_country_code(ctx.request)
    };
    this.aliens.set(conn.id, alien);

    // Send current aliens to new connection
    const currentAliens = Array.from(this.aliens.entries()).map(([id, data]) => ({
      id,
      ...data
    }));
    conn.send(
      JSON.stringify({
        type: "init",
        aliens: currentAliens
      })
    );

    // Broadcast new alien to all other connections
    this.room.broadcast(
      JSON.stringify({
        type: "new_alien",
        id: conn.id,
        country: alien.country
      }),
      [conn.id]
    );

    console.log(`Connection ${conn.id} connected from ${alien.country}`);
  }

  onMessage(messageStr: string, sender: Party.Connection) {
    try {
      const message = JSON.parse(messageStr) as Message;
      if (message.type === "waypoint") {
        // Simply relay the waypoint to other clients
        const broadcastMessage = JSON.stringify({
          type: "waypoint",
          alienId: sender.id,
          x: message.x,
          y: message.y
        });
        this.room.broadcast(broadcastMessage, [sender.id]);
      }
    } catch (e) {
      console.error("Error processing message:", e);
    }
  }

  onClose(conn: Party.Connection) {
    this.connections.delete(conn.id);
    this.aliens.delete(conn.id);

    // Notify other clients about the disconnection
    this.room.broadcast(
      JSON.stringify({
        type: "remove",
        alienId: conn.id
      }),
      [conn.id]
    );

    console.log(`Connection ${conn.id} disconnected`);
  }
}

Server satisfies Party.Worker;
