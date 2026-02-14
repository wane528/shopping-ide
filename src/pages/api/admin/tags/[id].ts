// src/pages/api/admin/tags/[id].ts
// 单个标签 CRUD API

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { tags, articleTags } from '@lib/db/schema';
import { eq } from 'drizzle-orm';

export const prerender = false;

// 获取单个标签
export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  
  try {
    const result = await db.select().from(tags).where(eq(tags.id, parseInt(id || '0')));
    
    if (result.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Tag not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ tag: result[0] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching tag:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch tag' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// 更新标签
export const POST: APIRoute = async ({ request, params, redirect }) => {
  const { id } = params;
  const tagId = parseInt(id || '0');
  
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    
    // 获取当前标签
    const current = await db.select().from(tags).where(eq(tags.id, tagId));
    if (current.length === 0) {
      return redirect('/admin/tags?error=not-found');
    }
    
    // 检查 slug 是否被其他标签占用
    if (slug !== current[0].slug) {
      const existing = await db.select().from(tags).where(eq(tags.slug, slug));
      if (existing.length > 0) {
        return redirect('/admin/tags?error=slug-exists');
      }
    }
    
    await db.update(tags)
      .set({ name, slug })
      .where(eq(tags.id, tagId));
    
    return redirect('/admin/tags?success=updated');
  } catch (error) {
    console.error('Error updating tag:', error);
    return redirect('/admin/tags?error=save-failed');
  }
};

// 删除标签
export const DELETE: APIRoute = async ({ params }) => {
  const { id } = params;
  
  try {
    const tagId = parseInt(id || '0');
    
    // 先删除文章-标签关联
    await db.delete(articleTags).where(eq(articleTags.tagId, tagId));
    
    // 再删除标签
    await db.delete(tags).where(eq(tags.id, tagId));
    
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deleting tag:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete tag' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
