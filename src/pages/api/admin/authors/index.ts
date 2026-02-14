// src/pages/api/admin/authors/index.ts
// 作者管理 API

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { authors, articles } from '@lib/db/schema';
import { eq } from 'drizzle-orm';

export const prerender = false;

// 获取所有作者
export const GET: APIRoute = async () => {
  try {
    const allAuthors = await db.select().from(authors);
    
    // 获取每个作者的文章数量
    const authorsWithCount = await Promise.all(
      allAuthors.map(async (author) => {
        const authorArticles = await db.select().from(articles).where(eq(articles.authorId, author.id));
        return {
          ...author,
          articleCount: authorArticles.length,
        };
      })
    );
    
    return new Response(
      JSON.stringify({ authors: authorsWithCount }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching authors:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch authors' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// 创建作者
export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const bio = (formData.get('bio') as string) || null;
    const avatar = (formData.get('avatar') as string) || null;
    const expertise = (formData.get('expertise') as string) || null;
    
    // 检查 slug 是否已存在
    const existing = await db.select().from(authors).where(eq(authors.slug, slug));
    if (existing.length > 0) {
      return redirect('/admin/authors?error=slug-exists');
    }
    
    await db.insert(authors).values({
      name,
      slug,
      bio,
      avatar,
      expertise: expertise ? JSON.stringify(expertise.split(',').map(e => e.trim())) : null,
    });
    
    return redirect('/admin/authors?success=created');
  } catch (error) {
    console.error('Error creating author:', error);
    return redirect('/admin/authors?error=save-failed');
  }
};
