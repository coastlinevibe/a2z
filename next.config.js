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
  // Workaround: avoid server vendor-chunk resolution for @supabase packages on Windows/Dev
  // by externalizing them from the server bundle so Node resolves them from node_modules.
  webpack: (config, { isServer }) => {
    if (isServer) {
      const externals = config.externals || []
      externals.push(/^@supabase\/.*$/)
      config.externals = externals
    }
    return config
  },
}

module.exports = nextConfig
