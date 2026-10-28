import type { NextConfig } from "next";

// For GitHub Pages, the deploy workflow sets NEXT_PUBLIC_BASE_PATH to
// "/<repo-name>". Locally it stays empty and the site runs at the root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  // Static export — GitHub Pages can only serve static files.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // Cache Components / PPR is incompatible with `output: "export"`.
  cacheComponents: false,
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
