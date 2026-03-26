import { json } from "@sveltejs/kit";
import { get_posts } from "$lib/queries/get_posts";

export async function GET() {
  console.log("[api/posts] GET request received");
  const posts = await get_posts();
  console.log("[api/posts] returning posts:", posts.length, "first:", posts[0]?.slug);
  return json(posts, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
