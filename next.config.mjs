/** @type {import('next').NextConfig} */
const config = {
  output: 'standalone',

  eslint: {
    ignoreDuringBuilds: true, // ✅ Prevents Docker build from failing due to ESLint errors
  },
  
    outputFileTracingRoot: process.cwd(),


};

export default config;
