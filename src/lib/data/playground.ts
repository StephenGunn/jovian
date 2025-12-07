export type PlaygroundItem = {
  title: string;
  slug: string;
  description: string;
  image?: string; // Optional featured image path
  date: string; // YYYY-MM-DD format
  categories: string[];
};

export const playground_items: PlaygroundItem[] = [
  {
    title: "Fish Tank",
    slug: "tank",
    description: "A multiplayer fish tank where you can swim around with others in real-time. Click anywhere to move your fish and see others swimming alongside you.",
    image: "/images/playground/fishtank.png", // You can add this later
    date: "2025-12-07",
    categories: ["multiplayer", "interactive", "partykit"]
  }
  // Add more playground items here as you create them
];
