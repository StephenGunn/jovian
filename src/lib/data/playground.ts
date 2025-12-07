export type PlaygroundItem = {
  title: string;
  slug: string;
  description: string;
  image?: string; // Optional featured image path
  date: string; // YYYY-MM-DD format
  categories: string[];
  related_posts?: string[]; // Slugs of blog posts that mention this playground item
};

export const playground_items: PlaygroundItem[] = [
  {
    title: "Fish Tank",
    slug: "tank",
    description: "A multiplayer fish tank where you can swim around with others in real-time. Click anywhere to move your fish and see others swimming alongside you.",
    image: "/images/playground/fishtank.png", // You can add this later
    date: "2025-12-07",
    categories: ["multiplayer", "interactive", "partykit"],
    related_posts: [
      "i-made-my-homepage-multiplayer"
      // Add more post slugs here as you write about the fish tank
    ]
  }
  // Add more playground items here as you create them
];
