import { json } from "@sveltejs/kit";
import type { Project } from "$lib/types/schema";

async function get_posts() {
  let posts: Project[] = [];

  const paths = import.meta.glob("/src/content/projects/*.md", { eager: true });

  for (const path in paths) {
    const file = paths[path];
    const slug = path.split("/").at(-1)?.replace(".md", "");

    if (file && typeof file === "object" && "metadata" in file && slug) {
      const metadata = file.metadata as Omit<Project, "slug">;
      const post = { ...metadata, slug } satisfies Project;
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
