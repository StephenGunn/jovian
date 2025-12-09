export type DevlogEntry = {
  date: string; // YYYY-MM-DD format
  title: string;
  description: string;
  screenshot?: string; // Optional screenshot filename (stored in /static/images/devlog/)
};

export type Goal = {
  text: string;
  completed: boolean;
};

export type PlaygroundItem = {
  title: string;
  slug: string;
  description: string;
  image?: string; // Optional featured image path
  date: string; // YYYY-MM-DD format
  categories: string[];
  status?: "in-progress" | "experimental" | "stable"; // Optional status flag
  related_posts?: string[]; // Slugs of blog posts that mention this playground item
  bluesky_thread_id?: string; // Bluesky thread ID for comments
  goals?: Goal[]; // Project goals/checklist
  devlog?: DevlogEntry[]; // Development log entries (newest first)
};

export const playground_items: PlaygroundItem[] = [
  {
    title: "Fish Tank",
    slug: "tank",
    description: "Remember those old Windows fish tank screensavers? I always wanted to make one, so why not now? Why not multiplayer? Why not 3D? Built with Threlte (Three.js + Svelte) using the same movement system from the multiplayer homepage—I had multiplayer dots swimming around in about 5 minutes, then thought... let's make it three-dimensional.",
    image: "/images/devlog/fishtank_version1.png",
    date: "2025-12-07",
    status: "in-progress",
    categories: ["multiplayer", "interactive", "partykit", "threlte"],
    related_posts: [
      "i-made-my-homepage-multiplayer"
    ],
    bluesky_thread_id: "3liij2ctiqc2t",
    goals: [
      { text: "Create project page", completed: true },
      { text: "Copy movement logic from homepage", completed: true },
      { text: "Start rendering in 3D", completed: true },
      { text: "Add random shapes to the scene", completed: true },
      { text: "Learn 3D scene composition", completed: false },
      { text: "Add more todos", completed: false }
    ],
    devlog: [
      {
        date: "2025-12-07",
        title: "Initial build: 2D to 3D multiplayer fish tank",
        description: "Started with a basic 2D multiplayer fish tank using SVG and PartyKit WebSockets—had fish swimming around in about 5 minutes. Then converted to 3D using Threlte (Three.js + Svelte). Fish are now oval shapes with eyes for directionality and rotate when swimming. Added basic decorations: gravel floor, rocks, and simple plants. Camera zoomed to fill screen like standing in front of a real aquarium.",
        screenshot: "fishtank_version1.png"
      }
    ]
  }
  // Add more playground items here as you create them
];
