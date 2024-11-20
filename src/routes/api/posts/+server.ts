import { json } from "@sveltejs/kit";
import type { Post } from "$lib/types/schema";
import { dev } from "$app/environment";

async function get_posts() {
  let posts: Post[] = [];

  const paths = import.meta.glob("/src/content/posts/*.md", { eager: true });

  for (const path in paths) {
    const file = paths[path];
    const slug = path.split("/").at(-1)?.replace(".md", "");

    if (file && typeof file === "object" && "metadata" in file && slug) {
      const metadata = file.metadata as Omit<Post, "slug">;
      const post = { ...metadata, slug } satisfies Post;
      if (dev) {
        post.published = true;
      }
      post.published && posts.push(post);
    }
  }

  posts = posts.sort(
    (first, second) => new Date(second.date).getTime() - new Date(first.date).getTime()
  );

  return posts;
}

export async function GET() {
  const posts = await get_posts();
  return json(posts);
}
