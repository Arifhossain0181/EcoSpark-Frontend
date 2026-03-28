import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "deifkwefumgah.cloudfront.net",
      },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
       
      },
    ];
  }
};

export default nextConfig;
