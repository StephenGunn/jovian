export type WaypointMessage = {
  type: "waypoint";
  x: number; // percentage from left
  y: number; // percentage from top
};

export type InitMessage = {
  type: "init";
  aliens: Array<{
    id: string;
    country: string;
  }>;
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
