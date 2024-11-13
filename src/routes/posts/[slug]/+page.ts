export const prerender = true;

import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { generate_starfield } from "$lib/layout/generate_starfield.svelte";

export const load: PageLoad = async ({ params }) => {
  try {
    const post = await import(`./../../../content/posts/${params.slug}.md`);

    // can we pass a component from the server to the client?
    return {
      content: post.default,
      meta: post.metadata,
      slug: params.slug,
      stars: generate_starfield()
    };
  } catch (e) {
    error(404, `Could not find ${params.slug}`);
  }
};
