import { fileURLToPath } from 'url';
import path from 'path';
import nextMDX from '@next/mdx'

const __filename = fileURLToPath(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 如果你的项目需要部署到子目录，还需要添加 basePath
  // basePath: '',
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/zh',
      },
      {
        source: '/about',
        destination: '/zh/about',
      },
      {
        source: '/daily',
        destination: '/zh/daily',
      },
      {
        source: '/daily/:slug*',
        destination: '/zh/daily/:slug*',
      },
      {
        source: '/posts',
        destination: '/zh/posts',
      },
      {
        source: '/posts/:slug*',
        destination: '/zh/posts/:slug*',
      },
      {
        // 支持完整路径
        source: '/:prefix(public)?/image/:path*',
        destination: '/image/:path*',
      },
    ];
  },
  experimental: {
    mdxRs: true,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // 优化字体加载
  optimizeFonts: true,
  // 优化构建输出
  output: 'standalone',
  // 优化图片加载
  images: {
    domains: [],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Configure `pageExtensions` to include MDX files
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  // Optionally, add any other Next.js config below
  // i18n: {
  //   locales: ['en', 'zh'],
  //   defaultLocale: 'zh',
  // },
};

const withMDX = nextMDX({
  extension: /\.mdx?$/,
  options: {
    // If you use remark-gfm, you'll need to use next.config.mjs
    // as the package is ESM only
    // https://github.com/remarkjs/remark-gfm#install
    remarkPlugins: [],
    rehypePlugins: [],
    // If you use `MDXProvider`, uncomment the following line.
    // providerImportSource: "@mdx-js/react",
  },
})

// Merge MDXdefinedConfig and Next.js config
export default withMDX(nextConfig)
