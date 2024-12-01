// See https://kit.svelte.dev/docs/types#app

import type { Themes } from "$lib/types/schema";

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      theme: Themes;
    }
    interface PageData {
      theme: Themes;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export { };
