export const prerender = false;

import type { Post } from "$lib/types/schema";
import type { PageServerLoad } from "./$types";
import { get_posts } from "$lib/queries/get_posts";
import { slugify } from "$lib/utility";

export const load: PageServerLoad = async ({ depends }) => {
  depends('data:posts');
  const posts: Post[] = await get_posts();

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
