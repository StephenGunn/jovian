import { json } from "@sveltejs/kit";
import { get_posts } from "$lib/queries/get_posts";

export async function GET() {
  const posts = await get_posts();
  return json(posts);
}
