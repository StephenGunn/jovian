export const prerender = true;

import type { Project } from "$lib/types/schema";
import type { PageServerLoad } from "./$types";
import { slugify } from "$lib/utility";

export const load: PageServerLoad = async ({ fetch }) => {
  const response = await fetch("/api/projects");
  const projects: Project[] = await response.json();

  // generate a map of our project categories
  const categories = new Map<string, string>();
  for (const project of projects) {
    for (const category of project.categories) {
      if (!categories.has(category)) {
        categories.set(slugify(category), category);
      }
    }
  }

  // generate an array of objects from the map for ease of use
  // and sort them by alphabetical order
  const generate_objects = (map: Map<string, string>) =>
    Array.from(map, ([slug, category]) => ({ slug, category })).sort((a, b) =>
      a.category.localeCompare(b.category)
    );
  return { projects: projects ?? [], categories: generate_objects(categories) };
};
