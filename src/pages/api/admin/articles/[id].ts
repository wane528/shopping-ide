// src/pages/api/admin/articles/[id].ts
// 单篇文章 CRUD API

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { articles } from '@lib/db/schema';
import { eq } from 'drizzle-orm';

export const prerender = false;

// 获取单篇文章
export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  
  try {
    const result = await db.select().from(articles).where(eq(articles.id, parseInt(id || '0')));
    
    if (result.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Article not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ article: result[0] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching article:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch article' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// 更新文章
export const POST: APIRoute = async ({ request, params, redirect }) => {
  const { id } = params;
  const articleId = parseInt(id || '0');
  
  try {
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const content = formData.get('content') as string;
    const category = formData.get('category') as string;
    let status = formData.get('status') as string;
    const featured = formData.get('featured') === 'true';
    const heroImage = (formData.get('heroImage') as string) || null;
    const metaTitle = (formData.get('metaTitle') as string) || null;
    const metaDescription = (formData.get('metaDescription') as string) || null;
    const canonical = (formData.get('canonical') as string) || null;
    const authorId = parseInt(formData.get('authorId') as string) || 1;
    
    // 处理定时发布
    const scheduledDate = formData.get('scheduledDate') as string;
    const scheduledTime = formData.get('scheduledTime') as string;
    let scheduledAt: string | null = null;
    
    if (status === 'scheduled' && scheduledDate && scheduledTime) {
      scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
    } else if (status === 'scheduled') {
      status = 'draft';
    }
    
    // 获取当前文章
    const current = await db.select().from(articles).where(eq(articles.id, articleId));
    if (current.length === 0) {
      return redirect('/admin/articles?error=not-found');
    }
    
    // 检查 slug 是否被其他文章占用
    if (slug !== current[0].slug) {
      const existing = await db.select().from(articles).where(eq(articles.slug, slug));
      if (existing.length > 0) {
        return redirect(`/admin/articles/${id}?error=slug-exists`);
      }
    }
    
    // 计算阅读时长
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    
    const now = new Date().toISOString();
    
    // 如果从草稿/定时变为发布，设置发布时间
    let publishedAt = current[0].publishedAt;
    if (status === 'published' && current[0].status !== 'published') {
      publishedAt = now;
    }
    
    await db.update(articles)
      .set({
        title,
        slug,
        description,
        content,
        category,
        status,
        featured,
        heroImage,
        metaTitle,
        metaDescription,
        canonical,
        authorId,
        readingTime,
        scheduledAt,
        publishedAt,
        updatedAt: now,
      })
      .where(eq(articles.id, articleId));
    
    return redirect('/admin/articles?success=updated');
  } catch (error) {
    console.error('Error updating article:', error);
    return redirect(`/admin/articles/${id}?error=save-failed`);
  }
};

// 删除文章
export const DELETE: APIRoute = async ({ params, cookies }) => {
  if (cookies.get('admin_auth')?.value !== 'true') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id } = params;
  
  try {
    await db.delete(articles).where(eq(articles.id, parseInt(id || '0')));
    
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deleting article:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete article' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};