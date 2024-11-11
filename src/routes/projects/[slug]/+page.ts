export const prerender = true;

import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import type { Project } from "$lib/types/schema";
import type { SvelteComponent } from "svelte";

export const load: PageLoad = async ({ params }) => {
  try {
    const post = await import(`./../../../content/projects/${params.slug}.md`);

    // can we pass a component from the server to the client?
    return {
      content: post.default as typeof SvelteComponent,
      meta: post.metadata as Project,
      slug: params.slug as string
    };
  } catch (e) {
    error(404, `Could not find ${params.slug}`);
  }
};
