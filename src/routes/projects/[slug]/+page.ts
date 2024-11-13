export const prerender = true;

import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import type { Project } from "$lib/types/schema";
import type { SvelteComponent } from "svelte";
import { generate_starfield } from "$lib/layout/generate_starfield.svelte";

export const load: PageLoad = async ({ params }) => {
  try {
    const post = await import(`./../../../content/projects/${params.slug}.md`);

    // can we pass a component from the server to the client?
    return {
      content: post.default as typeof SvelteComponent,
      meta: post.metadata as Project,
      slug: params.slug as string,
      stars: generate_starfield()
    };
  } catch (e) {
    error(404, `Could not find ${params.slug}`);
  }
};
