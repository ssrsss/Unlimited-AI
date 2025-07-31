/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 禁用构建时的 ESLint 检查
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['tc.yjie.fun'],
  },
};

module.exports = nextConfig; 