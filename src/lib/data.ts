import type { FactsMap } from "$lib/types/schema";

export const debug_mode = false;

export const menu = [
  {
    id: 1,
    title: "About",
    path: "/about"
  },
  {
    id: 2,
    title: "Posts",
    path: "/posts"
  },
  {
    id: 3,
    title: "Projects",
    path: "/projects"
  },
  {
    id: 4,
    title: "Contact",
    path: "/contact"
  }
] as const;

export type Sections = "home" | "about" | "posts" | "projects" | "contact";

export const facts: FactsMap = {
  Jupiter: {
    distance_km: "778.5 million km",
    distance_miles: "483.8 million miles",
    diameter_km: "139,822 km",
    diameter_miles: "86,881 miles",
    gravity: "24.79 m/s²",
    temperature_c: "-145°C",
    temperature_f: "-229°F",
    moons: 95,
    moons_not_shown: 92,
    orbit_days: "4333 days",
    orbit_years: "11.86 years"
  },
  Io: {
    distance_km: "421,700 km",
    distance_miles: "262,029 miles",
    diameter_km: "3,643 km",
    diameter_miles: "2,263 miles",
    gravity: "1.796 m/s²",
    temperature_c: "-143°C",
    temperature_f: "-225°F",
    moons: 0,
    orbit_days: "1.77 days"
  },
  Europa: {
    distance_km: "671,034 km",
    distance_miles: "416,980 miles",
    diameter_km: "3,121 km",
    diameter_miles: "1,940 miles",
    gravity: "1.314 m/s²",
    temperature_c: "-160°C",
    temperature_f: "-256°F",
    moons: 0,
    orbit_days: "3.55 days"
  },
  Ganymede: {
    distance_km: "1,070,412 km",
    distance_miles: "665,100 miles",
    diameter_km: "5,268 km",
    diameter_miles: "3,273 miles",
    gravity: "1.428 m/s²",
    temperature_c: "-163°C",
    temperature_f: "-261°F",
    moons: 0,
    orbit_days: "7.15 days"
  }
};
