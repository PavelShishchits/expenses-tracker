import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@expenses-tracker/shared'],
}

export default nextConfig
