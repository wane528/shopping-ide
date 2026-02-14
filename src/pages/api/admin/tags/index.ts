// src/pages/api/admin/tags/index.ts
// 标签管理 API

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { tags, articleTags } from '@lib/db/schema';
import { eq } from 'drizzle-orm';

export const prerender = false;

// 获取所有标签
export const GET: APIRoute = async () => {
  try {
    const allTags = await db.select().from(tags);
    
    // 获取每个标签的文章数量
    const tagsWithCount = await Promise.all(
      allTags.map(async (tag) => {
        const count = await db.select().from(articleTags).where(eq(articleTags.tagId, tag.id));
        return {
          ...tag,
          articleCount: count.length,
        };
      })
    );
    
    return new Response(
      JSON.stringify({ tags: tagsWithCount }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching tags:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch tags' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// 创建标签
export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    
    // 检查 slug 是否已存在
    const existing = await db.select().from(tags).where(eq(tags.slug, slug));
    if (existing.length > 0) {
      return redirect('/admin/tags?error=slug-exists');
    }
    
    await db.insert(tags).values({
      name,
      slug,
    });
    
    return redirect('/admin/tags?success=created');
  } catch (error) {
    console.error('Error creating tag:', error);
    return redirect('/admin/tags?error=save-failed');
  }
};
