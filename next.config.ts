import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @lakbay/contracts is a local `file:` dependency shipping raw .ts
  // source (see its package.json — no build step, generated/types.ts is
  // the committed output). Next.js doesn't transpile anything under
  // node_modules by default, symlinked local packages included, so
  // without this it 404s at build time with "Module not found" even
  // though the package resolves fine.
  transpilePackages: ["@lakbay/contracts"],
  turbopack: {
    // Lakbay.Web has its own package-lock.json, so Turbopack infers
    // *this* folder as the workspace root and refuses to resolve files
    // outside it — including ../Lakbay.Contracts, a sibling repo, even
    // though the tsconfig `paths` alias correctly points there. Widening
    // the root to the shared parent (Personal_Projects/Lakbay/) is the
    // documented fix for this exact "sibling repo, no real monorepo
    // tool" shape.
    root: path.join(__dirname, ".."),
  },
};

export default nextConfig;
