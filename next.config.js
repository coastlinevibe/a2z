/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      // Add your Supabase storage domain here
      // Example: 'your-project-id.supabase.co'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Disable standalone output to avoid build trace issues
  // output: 'standalone',
  experimental: {
    // Exclude node_modules from file tracing to prevent stack overflow
    outputFileTracingExcludes: {
      '*': ['node_modules/@swc/core-linux-x64-gnu', 'node_modules/@swc/core-linux-x64-musl'],
    },
  },
}

module.exports = nextConfig
