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
  
  const now = new Date().toISOString().split('T')[0];
  
  // 静态页面
  const staticPages = [
    { loc: '/', changefreq: 'daily', priority: 1.0, lastmod: now },
    { loc: '/about', changefreq: 'monthly', priority: 0.5, lastmod: now },
    { loc: '/category/guides', changefreq: 'daily', priority: 0.8, lastmod: now },
    { loc: '/category/reviews', changefreq: 'daily', priority: 0.8, lastmod: now },
    { loc: '/category/tips', changefreq: 'daily', priority: 0.8, lastmod: now },
    { loc: '/category/resources', changefreq: 'daily', priority: 0.8, lastmod: now },
  ];
  
  // 从数据库获取已发布的文章（不包括 scheduled 和 draft）
  let articlePages: { loc: string; changefreq: string; priority: number; lastmod?: string }[] = [];
  try {
    const publishedArticles = await db
      .select()
      .from(articles)
      .where(eq(articles.status, 'published'));
    
    console.log(`[Sitemap] Found ${publishedArticles.length} published articles`);
    
    if (publishedArticles.length > 0) {
      console.log('[Sitemap] Sample articles:', publishedArticles.slice(0, 3).map(a => ({ 
        slug: a.slug, 
        status: a.status,
        publishedAt: a.publishedAt 
      })));
    }
    
    articlePages = publishedArticles.map(article => {
      // 处理日期字段 - 从数据库返回的是ISO字符串
      const dateToUse = article.updatedAt || article.publishedAt || article.createdAt;
      const lastmod = dateToUse ? dateToUse.split('T')[0] : now;
      
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
    console.error('[Sitemap] Error details:', error instanceof Error ? error.message : String(error));
  }
  
  const allPages = [...staticPages, ...articlePages];
  console.log(`[Sitemap] Total URLs in sitemap: ${allPages.length}`);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${siteUrl}${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300', // 5分钟缓存
    },
  });
};