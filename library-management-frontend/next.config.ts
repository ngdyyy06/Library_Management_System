import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    devIndicators: false,

    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;