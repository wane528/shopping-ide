// src/pages/api/admin/articles/publish-scheduled.ts
// Vercel Cron Job endpoint — runs every hour
// Publishes articles whose scheduledAt <= now

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { articles } from '@lib/db/schema';
import { eq } from 'drizzle-orm';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  // Vercel Cron sends this header to verify the request is from Vercel
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${import.meta.env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const now = new Date().toISOString();

    // Fetch all scheduled articles
    const scheduledArticles = await db
      .select()
      .from(articles)
      .where(eq(articles.status, 'scheduled'));

    const toPublish = scheduledArticles.filter(
      (a) => a.scheduledAt && a.scheduledAt <= now
    );

    if (toPublish.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No articles due for publishing', published: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const published = [];
    for (const article of toPublish) {
      await db
        .update(articles)
        .set({
          status: 'published',
          publishedAt: article.scheduledAt || now,
          updatedAt: now,
        })
        .where(eq(articles.id, article.id));

      published.push({ id: article.id, title: article.title, slug: article.slug });
      console.log(`[Cron] Published: ${article.title}`);
    }

    return new Response(
      JSON.stringify({ message: `Published ${published.length} articles`, published }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Cron] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed', message: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
