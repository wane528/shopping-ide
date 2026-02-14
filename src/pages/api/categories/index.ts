// src/pages/api/categories/index.ts
// 分类列表 API

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { categories, articles } from '@lib/db/schema';
import { eq, count, desc } from 'drizzle-orm';

// 标记为 SSR 端点（不在构建时预渲染）
export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    // 获取所有分类
    const allCategories = await db
      .select()
      .from(categories)
      .orderBy(desc(categories.order));

    // 获取每个分类的文章数量
    const articleCounts = await db
      .select({
        category: articles.category,
        count: count(articles.id),
      })
      .from(articles)
      .where(eq(articles.status, 'published'))
      .groupBy(articles.category);

    // 合并数据
    const categoriesWithCount = allCategories.map((cat) => {
      const countData = articleCounts.find((c) => c.category === cat.slug);
      return {
        ...cat,
        articleCount: countData?.count || 0,
      };
    });

    return new Response(
      JSON.stringify({ categories: categoriesWithCount }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch categories' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
