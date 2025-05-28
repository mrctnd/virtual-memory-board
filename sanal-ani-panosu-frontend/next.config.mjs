/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5154',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'api',
        port: '8080',
        pathname: '/**',
      },
    ],
    // Allow blob URLs for uploaded image previews
    dangerouslyAllowSVG: false,
    // Allow unoptimized images for blob URLs and external sources
    unoptimized: false,
  },
  async rewrites() {
    return [
      {
        source: '/Uploads/:path*',
        destination: 'http://localhost:5154/Uploads/:path*',
      },
      {
        source: '/boards/Uploads/:path*',
        destination: 'http://localhost:5154/Uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
