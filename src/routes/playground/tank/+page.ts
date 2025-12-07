import type { PageLoad } from "./$types";
import { playground_items } from "$lib/data/playground";
import { get_posts_by_slugs } from "$lib/queries/get_posts_by_slugs";

export const load: PageLoad = async () => {
  const item = playground_items.find((i) => i.slug === "tank");

  if (!item) {
    throw new Error("Fish tank playground item not found");
  }

  const related_posts = item.related_posts
    ? await get_posts_by_slugs(item.related_posts)
    : [];

  return {
    item,
    related_posts
  };
};
