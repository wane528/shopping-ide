// src/pages/rss.xml.ts
// RSS Feed

import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { articles } from '@lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export const GET: APIRoute = async (context) => {
  let site = context.site?.toString() || 'http://localhost:4321';
  site = site.replace(/\/+$/, '');
  
  // 从数据库获取已发布的文章
  let feedItems: any[] = [];
  try {
    const publishedArticles = await db
      .select()
      .from(articles)
      .where(eq(articles.status, 'published'))
      .orderBy(desc(articles.publishedAt))
      .limit(20);
    
    feedItems = publishedArticles.map((article) => ({
      title: article.title,
      pubDate: new Date(article.publishedAt || Date.now()),
      description: article.description,
      link: `/${article.slug}`,
    }));
  } catch (error) {
    console.error('Error fetching articles for RSS:', error);
  }

  return rss({
    title: 'PuraCatCare',
    description: 'Pure science for cat health — evidence-based guides on feline urinary and kidney health.',
    site,
    items: feedItems,
    customData: `<language>en-us</language>
<copyright>Copyright ${new Date().getFullYear()} PuraCatCare</copyright>
<webMaster>puracatcare@hotmail.com</webMaster>`,
  });
};