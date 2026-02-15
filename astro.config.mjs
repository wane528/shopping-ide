import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// 从环境变量获取站点 URL
// Vercel 会自动设置 VERCEL_URL，我们优先使用自定义的 SITE_URL
const siteUrl = process.env.SITE_URL || 
                (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:4321');

console.log('[Config] Site URL:', siteUrl);

const isProduction = siteUrl.includes('goodsetup.store');

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  output: 'server', // Astro 5 中使用 server 替代 hybrid
  adapter: vercel({
    webAnalytics: { enabled: true },
    functionPerRoute: false,
    runtime: 'nodejs20.x',
  }),
  security: {
    checkOrigin: false, // 允许跨域表单提交（用于 admin 后台）
  },
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
