import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

// Svelte Component To Image
import { image_from_component, type RenderOptions } from "svelte-component-to-image";

// Normal .svelte component
import DemoImage from "$lib/to-image/DemoImage.svelte";
import { dev } from "$app/environment";

export const GET: RequestHandler = (async ({ url }) => {
  const props = {
    text: url.searchParams.get("text") ?? "Demo Text"
  } as const;

  try {
    const options: RenderOptions = {
      width: 1200,
      height: 600,
      props,
      fonts: [
        {
          name: "Jost",
          url: `${url.origin}/fonts/jost-v-webfont.woff`,
          weight: 400,
          style: "normal"
        }
      ],
      debug: true
    };

    // pass the component and options to the package
    const image = await image_from_component(DemoImage, options);
    const response = new Response(image);
    response.headers.append("Content-Type", "image/png");
    if (!dev) {
      response.headers.append(
        "Cache-Control",
        "s-maxage=604800, stale-while-revalidate=604800"
      );
    }
    return response;
  } catch (e) {
    console.error(e);
    throw error(500, "Error trying to generate image from component.");
  }
}) satisfies RequestHandler;
