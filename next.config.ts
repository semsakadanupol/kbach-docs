import path from "node:path";
import type { NextConfig } from "next";

/**
 * The docs build to plain files (`out/`): one HTML file per page, in English
 * and in Khmer, that any static host can serve. Nothing runs on a server.
 *
 *   npm run dev     the site at http://localhost:3000 (/en, /km), live as you edit
 *   npm run build   out/ (then `npm run start` to look at it)
 */
const nextConfig: NextConfig = {
  output: "export",
  // Cache Components and Partial Prefetching (create-next-app's defaults) are
  // for pages rendered on a server; every page here is built ahead of time,
  // so they're off.
  experimental: {
    agentFeedback: true,
    // The site has two root layouts (src/app/[lang] for every page, and
    // src/app/(start) for /), so its 404 page is the global one
    // (src/app/global-not-found.tsx)
    globalNotFound: true,
  },
  turbopack: {
    rules: {
      // `import text from './file?raw'` gives the file's text as a string (the
      // playground's example files and the script it puts in its canvas)
      "*": {
        condition: { query: "?raw" },
        loaders: [path.join(process.cwd(), "scripts", "raw-loader.cjs")],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
