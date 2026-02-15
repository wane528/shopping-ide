// Debug endpoint to check articles in database
import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { articles } from '@lib/db/schema';

export const GET: APIRoute = async () => {
  try {
    const allArticles = await db.select().from(articles);
    
    return new Response(JSON.stringify({
      total: allArticles.length,
      byStatus: {
        published: allArticles.filter(a => a.status === 'published').length,
        scheduled: allArticles.filter(a => a.status === 'scheduled').length,
        draft: allArticles.filter(a => a.status === 'draft').length,
      },
      articles: allArticles.map(a => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        status: a.status,
        publishedAt: a.publishedAt,
        createdAt: a.createdAt,
      })),
    }, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: String(error),
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
