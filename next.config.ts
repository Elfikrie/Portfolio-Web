import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.56.1'],
  experimental: {
    // Allow a 3 MB cover plus multipart fields; the server validates the actual file.
    serverActions: { bodySizeLimit: '4mb' },
  },
};

export default nextConfig;
