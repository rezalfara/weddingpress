// File: next.config.js (BARU)

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/dv5r7lepj/**',
      },
    ],
  },

  allowedDevOrigins: [
    "http://localhost:3000",
    "http://10.210.117.68:3000", // <-- IP BARU DITAMBAHKAN DI SINI
  ],

};

// --- PERUBAHAN UTAMA DI SINI ---
// Gunakan 'module.exports' (Sintaks CommonJS)
module.exports = nextConfig;