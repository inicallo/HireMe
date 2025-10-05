/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Your new Cloudinary domain
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      // Your existing domains
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
      },
      {
        protocol: 'https',
        hostname: 'img.daisyui.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

module.exports = nextConfig;