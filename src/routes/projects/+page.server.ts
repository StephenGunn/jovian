import type { Project } from "$lib/types/schema";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch }) => {
  const response = await fetch("/api/projects");
  const projects: Project[] = await response.json();
  return { projects: projects ?? [] };
};
