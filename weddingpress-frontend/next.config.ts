import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/dv5r7lepj/**', // Sesuaikan dengan Cloud Name Anda
      },
    ],
  },
};

export default nextConfig;
