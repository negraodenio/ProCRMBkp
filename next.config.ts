import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 
   * Dev-only webpack config for component tagger removed to avoid Turbopack conflicts in Production.
   * If needed in dev, uncomment or move to separate dev-only config.
   */
  // webpack: (config) => { ... } 
};

export default nextConfig;
