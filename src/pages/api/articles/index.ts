// src/pages/api/articles/index.ts
// 文章列表 API

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { articles, authors } from '@lib/db/schema';
import { desc, eq, and } from 'drizzle-orm';

// 标记为 SSR 端点（不在构建时预渲染）
export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const category = url.searchParams.get('category');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const featured = url.searchParams.get('featured');

    // 构建查询条件
    const conditions = [eq(articles.status, 'published')];
    
    if (category) {
      conditions.push(eq(articles.category, category));
    }
    
    if (featured === 'true') {
      conditions.push(eq(articles.featured, true));
    }

    // 查询文章列表
    const result = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        description: articles.description,
        category: articles.category,
        heroImage: articles.heroImage,
        publishedAt: articles.publishedAt,
        readingTime: articles.readingTime,
        featured: articles.featured,
        author: {
          id: authors.id,
          name: authors.name,
          slug: authors.slug,
          avatar: authors.avatar,
        },
      })
      .from(articles)
      .leftJoin(authors, eq(articles.authorId, authors.id))
      .where(and(...conditions))
      .orderBy(desc(articles.publishedAt))
      .limit(limit)
      .offset(offset);

    // 获取总数
    const countResult = await db
      .select({ count: articles.id })
      .from(articles)
      .where(and(...conditions));
    
    const total = countResult.length;

    return new Response(
      JSON.stringify({
        articles: result,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching articles:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch articles' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
