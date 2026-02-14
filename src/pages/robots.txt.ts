// src/pages/robots.txt.ts
// 动态生成 robots.txt

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  // 确保没有尾部斜杠
  let siteUrl = site?.toString() || 'http://localhost:4321';
  siteUrl = siteUrl.replace(/\/+$/, '');
  
  const robotsTxt = `User-agent: *
Allow: /

# 禁止抓取后台管理和 API 路由
Disallow: /admin/
Disallow: /api/

# Sitemap
Sitemap: ${siteUrl}/sitemap-index.xml
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};