export const prerender = true;

import type { RequestHandler } from "@sveltejs/kit";
import { get_posts } from "$lib/queries/get_posts";
import { config } from "$lib/config";

export const GET: RequestHandler = async () => {
  const posts = await get_posts();
  const headers = { "Content-Type": "application/xml" };

  const xml = `
		<rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
			<channel>
				<title>${config.site_name}</title>
				<description>${config.site_description}</description>
				<link>${config.site_url}</link>
				<atom:link href="${config.site_url}rss.xml" rel="self" type="application/rss+xml"/>
				${posts
          .map(
            (post) => `
						<item>
							<title>${post.title}</title>
							<description>${post.description}</description>
							<link>${config.site_url}/posts/${post.slug}</link>
							<guid isPermaLink="true">${config.site_url}/posts/${post.slug}</guid>
							<pubDate>${new Date(post.date).toUTCString()}</pubDate>
						</item>
					`
          )
          .join("")}
			</channel>
		</rss>
	`.trim();

  return new Response(xml, { headers });
};
