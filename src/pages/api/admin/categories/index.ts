// src/pages/api/admin/categories/index.ts
// 分类管理 API

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { categories, articles } from '@lib/db/schema';
import { eq, count, desc } from 'drizzle-orm';

export const prerender = false;

// 获取所有分类
export const GET: APIRoute = async () => {
  try {
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
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch categories' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// 创建分类
export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const description = (formData.get('description') as string) || null;
    const color = (formData.get('color') as string) || 'blue';
    
    // 检查 slug 是否已存在
    const existing = await db.select().from(categories).where(eq(categories.slug, slug));
    if (existing.length > 0) {
      return redirect('/admin/categories?error=slug-exists');
    }
    
    // 获取最大排序值
    const allCats = await db.select().from(categories);
    const maxOrder = allCats.reduce((max, cat) => Math.max(max, cat.order || 0), 0);
    
    await db.insert(categories).values({
      name,
      slug,
      description,
      color,
      order: maxOrder + 1,
    });
    
    return redirect('/admin/categories?success=created');
  } catch (error) {
    console.error('Error creating category:', error);
    return redirect('/admin/categories?error=save-failed');
  }
};
