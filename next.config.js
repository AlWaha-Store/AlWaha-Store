/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['vxjjlfuxsnjvttpspdar.supabase.co'],
    unoptimized: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
}

module.exports = nextConfig 
