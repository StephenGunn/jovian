import type { Post } from "$lib/types/schema";
import { get_posts } from "./get_posts";

export const get_posts_by_slugs = async (slugs: string[]): Promise<Post[]> => {
  const all_posts = await get_posts();
  return all_posts.filter((post) => slugs.includes(post.slug));
};
