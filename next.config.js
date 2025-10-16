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
  // Enable static exports for better performance
  output: 'standalone',
}

module.exports = nextConfig
