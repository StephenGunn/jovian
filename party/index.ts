import type * as Party from "partykit/server";
import type { Message } from "../src/lib/types/multiplayer";

type AlienData = {
  country: string;
};

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

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // Store country code in room storage for persistence
    const alien: AlienData = {
      country: this.get_valid_country_code(ctx.request)
    };
    await this.room.storage.put(`alien:${conn.id}`, alien);

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

  onMessage(messageStr: string, sender: Party.Connection) {
    try {
      const message = JSON.parse(messageStr) as any;

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
    // Remove alien from storage
    await this.room.storage.delete(`alien:${conn.id}`);

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
}

Server satisfies Party.Worker;
