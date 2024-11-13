export type Category = {
  value: string;
  slug: string;
};

export type Post = {
  title: string;
  slug: string;
  description: string;
  date: string;
  updated?: string;
  categories: string[];
  published: boolean;
};

export type Project = {
  title: string;
  slug: string;
  description: string;
  date: string;
  updated?: string;
  categories: Categories[];
  published: boolean;
  project_status?: "live" | "in progress" | "archived";
  repo_url?: string;
  live_url?: string;
};

export type CelestialBodyFacts = {
  distance_km: string;
  distance_miles: string;
  diameter_km: string;
  diameter_miles: string;
  gravity: string;
  temperature_c: string;
  temperature_f: string;
  moons: number;
  orbit_days: string;
  orbit_years?: string;
  moons_not_shown?: number;
};

export type FactsMap = {
  Jupiter: CelestialBodyFacts;
  Io: CelestialBodyFacts;
  Europa: CelestialBodyFacts;
  Ganymede: CelestialBodyFacts;
};

export type CelestialBody = keyof FactsMap;

export type CelestialBodyData = {
  x: number;
  y: number;
  width: number;
  height: number;
  show_info: boolean;
};

export type Coords = {
  x: number;
  y: number;
};
