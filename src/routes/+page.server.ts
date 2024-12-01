import type { PageServerLoad, Actions } from "./$types";
import { generate_starfield } from "$lib/layout/generate_starfield.svelte";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async () => {
  return {
    stars: generate_starfield()
  };
};

export const actions: Actions = {
  setTheme: async ({ url, cookies }) => {
    console.log("setTheme action");
    const theme: string = url.searchParams.get("theme") || "system";
    const redirectTo = url.searchParams.get("redirect");

    if (theme === "light" || theme === "dark" || theme === "system") {
      cookies.set("theme", theme, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    }

    throw redirect(303, redirectTo ?? "/");
  }
};
