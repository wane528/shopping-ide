import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel/serverless';

// 从环境变量获取站点 URL，开发环境默认 localhost
const siteUrl = process.env.SITE_URL || 'http://localhost:4321';
const isProduction = siteUrl.includes('goodsetup.store');

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  output: 'hybrid', // 静态优先 + 按需 SSR
  adapter: vercel({
    webAnalytics: { enabled: true },
    functionPerRoute: false,
  }),
  integrations: [
    tailwind(),
    // 仅在生产环境启用 sitemap
    isProduction && sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => {
        // 排除草稿、后台管理、API 路由
        return !page.includes('/draft/') && 
               !page.includes('/admin') && 
               !page.includes('/api/');
      },
    }),
  ].filter(Boolean),
  vite: {
    ssr: {
      noExternal: ['@supabase/supabase-js'],
    },
  },
});
