// API to publish all scheduled articles
import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { articles } from '@lib/db/schema';
import { eq } from 'drizzle-orm';

export const prerender = false;

const checkAuth = (cookies: any) => {
  return cookies.get('admin_auth')?.value === 'true';
};

export const POST: APIRoute = async ({ cookies }) => {
  if (!checkAuth(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    console.log('[Publish All] Fetching scheduled articles...');
    
    const scheduledArticles = await db
      .select()
      .from(articles)
      .where(eq(articles.status, 'scheduled'));
    
    console.log(`[Publish All] Found ${scheduledArticles.length} scheduled articles`);
    
    if (scheduledArticles.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No scheduled articles to publish',
          published: 0,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const now = new Date().toISOString();
    const published = [];
    
    for (const article of scheduledArticles) {
      console.log(`[Publish All] Publishing: ${article.title}`);
      
      await db
        .update(articles)
        .set({
          status: 'published',
          publishedAt: article.scheduledAt || now,
          updatedAt: now,
        })
        .where(eq(articles.id, article.id));
      
      published.push({
        id: article.id,
        title: article.title,
        slug: article.slug,
      });
    }
    
    console.log(`[Publish All] Successfully published ${published.length} articles`);
    
    return new Response(
      JSON.stringify({ 
        message: `Successfully published ${published.length} articles`,
        published,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Publish All] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to publish articles',
        message: String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
