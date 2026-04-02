// src/app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FRC Scouting",
    short_name: "Scouting",
    description: "Offline-capable FRC scouting app",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1976d2",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
