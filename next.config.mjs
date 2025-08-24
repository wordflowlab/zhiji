/** @type {import('next').NextConfig} */
const nextConfig = {
  // 禁用图片优化（Cloudflare Pages 不支持）
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
