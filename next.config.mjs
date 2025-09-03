/** @type {import('next').NextConfig} */
const config = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: process.cwd(),
  },
};

export default config;
