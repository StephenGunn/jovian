type Categories = "sveltekit" | "svelte";

export type Post = {
  title: string;
  slug: string;
  description: string;
  date: string;
  categories: Categories[];
  published: boolean;
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
