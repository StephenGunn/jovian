export const prerender = false;

import type { PageServerLoad } from "./$types";
import { generate_starfield } from "$lib/layout/generate_starfield.svelte";

export const load: PageServerLoad = async () => {
  return {
    stars: generate_starfield()
  };
};
