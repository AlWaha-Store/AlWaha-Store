/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['vxjjlfuxsnjvttpspdar.supabase.co'],
  },
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig 
