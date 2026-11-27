import path from "node:path";
import type { NextConfig } from "next";

/**
 * The docs build to plain files (`out/`): one HTML file per page, that any
 * static host can serve. Nothing runs on a server.
 *
 *   npm run dev     the site at http://localhost:3000, live as you edit
 *   npm run build   out/ (then `npm run start` to look at it)
 */
const nextConfig: NextConfig = {
  output: "export",
  // Cache Components and Partial Prefetching (create-next-app's defaults) are
  // for pages rendered on a server; every page here is built ahead of time,
  // so they're off.
  experimental: {
    agentFeedback: true,
    // The 404 page (src/app/global-not-found.tsx) brings its own <html> and
    // site frame, outside the root layout, for any address with no page
    globalNotFound: true,
  },
  turbopack: {
    // This folder is its own project (the kbach-docs repository) even when it's checked out
    // inside the Kbach repository, whose package-lock.json Next.js would otherwise take as
    // the root: it then wrote build files to apps/kbach-docs/apps/kbach-docs/.next.
    root: process.cwd(),
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
