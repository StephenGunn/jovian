export type PlaygroundItem = {
  title: string;
  slug: string;
  description: string;
  image?: string; // Optional featured image path
  date: string; // YYYY-MM-DD format
  categories: string[];
  related_posts?: string[]; // Slugs of blog posts that mention this playground item
  bluesky_thread_id?: string; // Bluesky thread ID for comments
};

export const playground_items: PlaygroundItem[] = [
  {
    title: "Fish Tank",
    slug: "tank",
    description: "I've wanted to add a 'playground' to my site since I started it. A distant echo back to the days of k10k's issues, but with much less direction, style, and skill. Not by choice of course! I grew up on those. This will hold the things that don't fit under blog posts, shouldn't be on a subdomain, etc. The first one came to me in a dream. I always loved fishtank screensavers on old Windows computers. I've always wanted to make a fishtank, so why not now? Why not multiplayer? The rocket ship logic on the homepage is basically a 2D fishtank, so I decided to rip that code and I had multiplayer dots floating around in about 5 minutes.",
    image: "/images/playground/fishtank.png", // You can add this later
    date: "2025-12-07",
    categories: ["multiplayer", "interactive", "partykit"],
    related_posts: [
      "i-made-my-homepage-multiplayer"
    ]
  }
  // Add more playground items here as you create them
];
