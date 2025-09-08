/** @type {import('next').NextConfig} */
const config = {
  output: 'standalone',

  eslint: {
    ignoreDuringBuilds: true, // ✅ Prevents Docker build from failing due to ESLint errors
  },
  
    outputFileTracingRoot: process.cwd(),
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://coappapi.commapp.online/api/:path*',
      },
      {
        source: '/auth/:path*',
        destination: 'https://coappapi.commapp.online/auth/:path*',
      },
    ];
  },
};

export default config;
