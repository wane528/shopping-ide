// src/pages/api/admin/authors/[id].ts
// 单个作者 CRUD API

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { authors, articles } from '@lib/db/schema';
import { eq } from 'drizzle-orm';

export const prerender = false;

// 获取单个作者
export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  
  try {
    const result = await db.select().from(authors).where(eq(authors.id, parseInt(id || '0')));
    
    if (result.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Author not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ author: result[0] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching author:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch author' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// 更新作者
export const POST: APIRoute = async ({ request, params, redirect }) => {
  const { id } = params;
  const authorId = parseInt(id || '0');
  
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const bio = (formData.get('bio') as string) || null;
    const avatar = (formData.get('avatar') as string) || null;
    const expertise = (formData.get('expertise') as string) || null;
    
    // 获取当前作者
    const current = await db.select().from(authors).where(eq(authors.id, authorId));
    if (current.length === 0) {
      return redirect('/admin/authors?error=not-found');
    }
    
    // 检查 slug 是否被其他作者占用
    if (slug !== current[0].slug) {
      const existing = await db.select().from(authors).where(eq(authors.slug, slug));
      if (existing.length > 0) {
        return redirect('/admin/authors?error=slug-exists');
      }
    }
    
    await db.update(authors)
      .set({
        name,
        slug,
        bio,
        avatar,
        expertise: expertise ? JSON.stringify(expertise.split(',').map(e => e.trim())) : null,
      })
      .where(eq(authors.id, authorId));
    
    return redirect('/admin/authors?success=updated');
  } catch (error) {
    console.error('Error updating author:', error);
    return redirect('/admin/authors?error=save-failed');
  }
};

// 删除作者
export const DELETE: APIRoute = async ({ params }) => {
  const { id } = params;
  
  try {
    const authorId = parseInt(id || '0');
    
    // 检查是否有文章使用此作者
    const authorArticles = await db.select().from(articles).where(eq(articles.authorId, authorId));
    if (authorArticles.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Cannot delete author with articles' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    await db.delete(authors).where(eq(authors.id, authorId));
    
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deleting author:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete author' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
