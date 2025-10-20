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
    // Skip build trace to avoid stack overflow
    outputFileTracingIgnores: ['**/*'],
  },
}

module.exports = nextConfig
