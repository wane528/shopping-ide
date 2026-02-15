import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

// 从环境变量获取站点 URL
// Vercel 会自动设置 VERCEL_URL，我们优先使用自定义的 SITE_URL
const siteUrl = process.env.SITE_URL || 
                (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:4321');

console.log('[Config] Site URL:', siteUrl);

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
    // 注意：不使用 @astrojs/sitemap 插件，因为它无法处理 server 模式的动态页面
    // 我们使用自定义的 sitemap-index.xml.ts 来生成 sitemap
  ],
  vite: {
    ssr: {
      noExternal: ['@supabase/supabase-js'],
    },
  },
});
