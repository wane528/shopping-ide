// src/pages/api/admin/articles/update-date.ts
// 快速更新文章发布时间

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { articles } from '@lib/db/schema';
import { eq } from 'drizzle-orm';

export const prerender = false;

const checkAuth = (cookies: any) => {
  return cookies.get('admin_auth')?.value === 'true';
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!checkAuth(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { articleId, publishedAt, scheduledAt, status } = body;

    if (!articleId) {
      return new Response(
        JSON.stringify({ error: 'Article ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (publishedAt !== undefined) {
      updateData.publishedAt = publishedAt;
    }

    if (scheduledAt !== undefined) {
      updateData.scheduledAt = scheduledAt;
    }

    if (status) {
      updateData.status = status;
    }

    await db
      .update(articles)
      .set(updateData)
      .where(eq(articles.id, articleId));

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Update date error:', error);
    return new Response(
      JSON.stringify({ error: 'Update failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
