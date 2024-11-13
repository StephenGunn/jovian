export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/[^\w_]+/g, "") // Remove all non-word characters except underscores
    .replace(/__+/g, "_") // Replace multiple underscores with a single one
    .replace(/^_|_$/g, ""); // Trim underscores from the start and end
