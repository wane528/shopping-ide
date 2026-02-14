// src/pages/api/admin/categories/[id].ts
// 单个分类 CRUD API

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { categories, articles } from '@lib/db/schema';
import { eq } from 'drizzle-orm';

export const prerender = false;

// 获取单个分类
export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  
  try {
    const result = await db.select().from(categories).where(eq(categories.id, parseInt(id || '0')));
    
    if (result.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Category not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ category: result[0] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching category:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch category' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// 更新分类
export const POST: APIRoute = async ({ request, params, redirect }) => {
  const { id } = params;
  const categoryId = parseInt(id || '0');
  
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const description = (formData.get('description') as string) || null;
    const color = (formData.get('color') as string) || 'blue';
    
    // 获取当前分类
    const current = await db.select().from(categories).where(eq(categories.id, categoryId));
    if (current.length === 0) {
      return redirect('/admin/categories?error=not-found');
    }
    
    // 检查 slug 是否被其他分类占用
    if (slug !== current[0].slug) {
      const existing = await db.select().from(categories).where(eq(categories.slug, slug));
      if (existing.length > 0) {
        return redirect(`/admin/categories?error=slug-exists`);
      }
      
      // 更新所有使用旧 slug 的文章
      await db.update(articles)
        .set({ category: slug })
        .where(eq(articles.category, current[0].slug));
    }
    
    await db.update(categories)
      .set({ name, slug, description, color })
      .where(eq(categories.id, categoryId));
    
    return redirect('/admin/categories?success=updated');
  } catch (error) {
    console.error('Error updating category:', error);
    return redirect('/admin/categories?error=save-failed');
  }
};

// 删除分类
export const DELETE: APIRoute = async ({ params }) => {
  const { id } = params;
  
  try {
    const categoryId = parseInt(id || '0');
    
    // 获取分类信息
    const cat = await db.select().from(categories).where(eq(categories.id, categoryId));
    if (cat.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Category not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 检查是否有文章使用此分类
    const articlesInCategory = await db.select().from(articles).where(eq(articles.category, cat[0].slug));
    if (articlesInCategory.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Cannot delete category with articles' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    await db.delete(categories).where(eq(categories.id, categoryId));
    
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deleting category:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete category' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
