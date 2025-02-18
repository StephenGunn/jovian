export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/[^\w_]+/g, "") // Remove all non-word characters except underscores
    .replace(/__+/g, "_") // Replace multiple underscores with a single one
    .replace(/^_|_$/g, ""); // Trim underscores from the start and end

export function code_to_emoji(countryCode: string): string {
  if (countryCode === "UNKNOWN" || countryCode.length !== 2) {
    return "🏴‍☠️";
  }

  const code = countryCode.toUpperCase();

  if (!/^[A-Z]{2}$/.test(code)) {
    return "🏴‍☠️";
  }

  const REGIONAL_INDICATOR_OFFSET = 127397;
  const firstChar = code.charCodeAt(0) + REGIONAL_INDICATOR_OFFSET;
  const secondChar = code.charCodeAt(1) + REGIONAL_INDICATOR_OFFSET;

  return String.fromCodePoint(firstChar) + String.fromCodePoint(secondChar);
}
