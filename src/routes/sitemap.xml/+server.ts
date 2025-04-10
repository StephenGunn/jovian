import type { Post, Project } from "$lib/types/schema";
import type { RequestHandler } from "./$types";
import { dev } from "$app/environment";
import { error } from "@sveltejs/kit";
import dayjs from "dayjs";

export const GET: RequestHandler = async ({ fetch, setHeaders }) => {
  const site = "https://jovianmoon.io";

  const posts: Post[] = await (await fetch("/api/posts")).json();
  const projects: Project[] = await (await fetch("/api/projects")).json();

  if (!posts || !projects) {
    error(500, "Failed to generate the sitemap.");
  }

  // added a helper function to format the date to make sure it's in the correct format
  // since I manually set the date in the frontmatter of the markdown
  const format_date = (date: string) => dayjs(date).format("YYYY-MM-DD");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${site}</loc>
    <lastmod>2024-11-09</lastmod>
  </url>
  <url>
    <loc>${site}/posts</loc>
    <lastmod>2024-11-01</lastmod>
  </url>
  <url>
    <loc>${site}/projects</loc>
    <lastmod>2024-11-01</lastmod>
  </url>
  <url>
    <loc>${site}/about</loc>
    <lastmod>2024-11-01</lastmod>
  </url>
  <url>
    <loc>${site}/contact</loc>
    <lastmod>2024-11-01</lastmod>
  </url>
  ${posts
      .map(
        (post) => `
  <url>
    <loc>${site}/posts/${post.slug}</loc>
    <lastmod>${format_date(post.updated ?? post.date)}</lastmod>
  </url>`
      )
      .join("")}
  ${projects
      .map(
        (project) => `
  <url>
    <loc>${site}/projects/${project.slug}</loc>
    <lastmod>${format_date(project.updated ?? project.date)}</lastmod>
  </url>`
      )
      .join("")}
</urlset>
`;
  setHeaders({ "Content-Type": "application/xml" });

  // only cache in production - 1 hour
  if (!dev) {
    setHeaders({ "Cache-Control": "s-maxage=3600, stale-while-revalidate" });
  }

  return new Response(xml);
};
