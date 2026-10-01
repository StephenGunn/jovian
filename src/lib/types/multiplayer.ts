export type WaypointMessage = {
  type: "waypoint";
  x: number; // percentage from left
  y: number; // percentage from top
};

export type GhostWaypoint = {
  x: number;
  y: number;
  dt: number; // ms since flight start
};

export type GhostFlight = {
  id: string;
  country: string;
  waypoints: GhostWaypoint[];
};

export type InitMessage = {
  type: "init";
  aliens: Array<{
    id: string;
    country: string;
  }>;
  ghosts?: GhostFlight[];
};

export type NewAlienMessage = {
  type: "new_alien";
  id: string;
  country: string;
};

export type RemoveMessage = {
  type: "remove";
  alienId: string;
};

export type Message = WaypointMessage | InitMessage | NewAlienMessage | RemoveMessage;
