// src/pages/sitemap-index.xml.ts
// 动态生成 sitemap

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { articles } from '@lib/db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ site }) => {
  // 使用 Astro 的 site 配置，确保与 astro.config.mjs 一致
  let siteUrl = site?.toString() || 'https://www.goodsetup.store';
  siteUrl = siteUrl.replace(/\/+$/, ''); // 移除尾部斜杠
  
  // 静态页面
  const staticPages = [
    { loc: '/', changefreq: 'weekly', priority: 1.0, lastmod: new Date().toISOString().split('T')[0] },
    { loc: '/about', changefreq: 'monthly', priority: 0.5 },
    { loc: '/category/guides', changefreq: 'weekly', priority: 0.7 },
    { loc: '/category/reviews', changefreq: 'weekly', priority: 0.7 },
    { loc: '/category/tips', changefreq: 'weekly', priority: 0.7 },
    { loc: '/category/resources', changefreq: 'weekly', priority: 0.7 },
  ];
  
  // 从数据库获取已发布和已调度的文章
  let articlePages: { loc: string; changefreq: string; priority: number; lastmod?: string }[] = [];
  try {
    const publishedArticles = await db
      .select()
      .from(articles)
      .where(eq(articles.status, 'published'));
    
    const scheduledArticles = await db
      .select()
      .from(articles)
      .where(eq(articles.status, 'scheduled'));
    
    const allArticles = [...publishedArticles, ...scheduledArticles];
    
    console.log(`[Sitemap] Found ${allArticles.length} articles (${publishedArticles.length} published, ${scheduledArticles.length} scheduled)`);
    console.log('[Sitemap] Sample articles:', allArticles.slice(0, 3).map(a => ({ slug: a.slug, status: a.status })));
    
    articlePages = allArticles.map(article => {
      // 处理日期字段 - 从数据库返回的是ISO字符串
      const dateToUse = article.updatedAt || article.createdAt;
      const lastmod = dateToUse ? dateToUse.split('T')[0] : undefined;
      
      return {
        loc: `/${article.slug}`,
        changefreq: 'monthly',
        priority: article.featured ? 0.9 : 0.8,
        lastmod,
      };
    });
    
    console.log(`[Sitemap] Generated ${articlePages.length} article URLs`);
  } catch (error) {
    console.error('[Sitemap] Error fetching articles:', error);
  }
  
  const allPages = [...staticPages, ...articlePages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${siteUrl}${page.loc}</loc>${page.lastmod ? `
    <lastmod>${page.lastmod}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300', // 减少到5分钟缓存
    },
  });
};