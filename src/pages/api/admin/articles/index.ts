// src/pages/api/admin/articles/index.ts
// 文章 CRUD API

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { articles } from '@lib/db/schema';
import { eq, desc, like, and } from 'drizzle-orm';

export const prerender = false;

// 认证检查辅助函数
const checkAuth = (cookies: any) => {
  return cookies.get('admin_auth')?.value === 'true';
};

// 获取文章列表
export const GET: APIRoute = async ({ url, cookies }) => {
  if (!checkAuth(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  try {
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';
    const status = url.searchParams.get('status') || '';
    
    // 构建查询条件
    const conditions = [];
    if (search) {
      conditions.push(like(articles.title, `%${search}%`));
    }
    if (category) {
      conditions.push(eq(articles.category, category));
    }
    if (status) {
      conditions.push(eq(articles.status, status));
    }
    
    const allArticles = await db
      .select()
      .from(articles)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(articles.createdAt));
    
    return new Response(
      JSON.stringify({ articles: allArticles }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
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

// 创建文章
export const POST: APIRoute = async ({ request, redirect, cookies }) => {
  if (!checkAuth(cookies)) {
    return new Response(JSON.stringify({ error: 'unauthorized', message: '请先登录' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  try {
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const content = formData.get('content') as string;
    const category = formData.get('category') as string;
    let status = (formData.get('status') as string) || 'draft';
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
      // 如果选择了定时发布但没有设置时间，改为草稿
      status = 'draft';
    }
    
    // 检查 slug 是否已存在
    const existing = await db.select().from(articles).where(eq(articles.slug, slug));
    if (existing.length > 0) {
      return new Response(JSON.stringify({ error: 'slug-exists', message: 'URL Slug 已存在' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // 计算阅读时长（假设每分钟阅读 200 个单词）
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    
    const now = new Date().toISOString();
    
    await db.insert(articles).values({
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
      publishedAt: status === 'published' ? now : null,
      updatedAt: now,
      createdAt: now,
    });
    
    const message = status === 'scheduled' 
      ? `文章已设置为定时发布，将在 ${scheduledAt ? new Date(scheduledAt).toLocaleString('zh-CN') : ''} 自动发布`
      : undefined;
    
    return new Response(JSON.stringify({ 
      success: true, 
      redirect: '/admin/articles?success=created',
      message 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating article:', error);
    return new Response(JSON.stringify({ error: 'save-failed', message: '保存失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};