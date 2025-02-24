export const prerender = true;

import type { Post } from "$lib/types/schema";
import type { PageServerLoad } from "./$types";

import { slugify } from "$lib/utility";

export const load: PageServerLoad = async ({ fetch }) => {
  const response = await fetch("/api/posts");
  const posts: Post[] = await response.json();

  // generate a map of our post categories
  const categories = new Map<string, string>();
  for (const post of posts) {
    for (const category of post.categories) {
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

  return { posts: posts ?? [], categories: generate_objects(categories) };
};
