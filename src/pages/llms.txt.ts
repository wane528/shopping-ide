// src/pages/llms.txt.ts
// 动态生成 AI 爬虫索引文件

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { articles } from '@lib/db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ site }) => {
  // 确保没有尾部斜杠
  let siteUrl = site?.toString() || 'http://localhost:4321';
  siteUrl = siteUrl.replace(/\/+$/, '');
  
  // 从数据库获取文章列表
  let articleList = '';
  try {
    const publishedArticles = await db
      .select()
      .from(articles)
      .where(eq(articles.status, 'published'));
    
    if (publishedArticles.length > 0) {
      articleList = '\n### Recent Articles\n' + publishedArticles
        .slice(0, 10)
        .map(a => `- ${a.title}: ${siteUrl}/${a.slug}`)
        .join('\n');
    }
  } catch (error) {
    console.error('Error fetching articles for llms.txt:', error);
  }
  
  const llmsTxt = `# GoodSetup

> A content site focused on setup guides, reviews, tips, and resources.

## Website

- URL: ${siteUrl}
- Language: English
- Content-Type: Educational, Informational

## Content Overview

### Categories
- Guides: In-depth tutorials and comprehensive guides
- Reviews: Honest product and service reviews
- Tips: Quick tips and practical advice
- Resources: Curated tools and resources

### Content Standards
- All content is fact-checked and reviewed
- Articles include publication and update dates
- Author credentials are verified
${articleList}

## API Endpoints

- GET ${siteUrl}/api/articles - List all articles
- GET ${siteUrl}/api/articles/[slug] - Get article by slug
- GET ${siteUrl}/api/categories - List all categories

## Contact

- Email: goodsetup@pronto.me
- Twitter: @goodsetup
`;

  return new Response(llmsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};