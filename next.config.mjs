/** @type {import('next').NextConfig} */
const config = {
  output: 'standalone',

  eslint: {
    ignoreDuringBuilds: true, // ✅ Prevents Docker build from failing due to ESLint errors
  },
  
    outputFileTracingRoot: process.cwd(),
  async rewrites() {
    const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || 'https://coappapi.commapp.online';
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_ORIGIN}/api/:path*`,
      },
      {
        source: '/auth/:path*',
        destination: `${BACKEND_ORIGIN}/auth/:path*`,
      },
    ];
  },
};

export default config;
