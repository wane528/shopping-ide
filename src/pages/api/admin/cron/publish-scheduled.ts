// src/pages/api/admin/cron/publish-scheduled.ts
// 定时发布任务 API
// 可通过外部 cron 服务或 Vercel Cron 调用

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { articles } from '@lib/db/schema';
import { eq, and, lt, isNotNull } from 'drizzle-orm';

export const prerender = false;

// 验证 cron 密钥（可选，用于安全验证）
const verifyCronSecret = (request: Request) => {
  const authHeader = request.headers.get('authorization');
  const cronSecret = import.meta.env.CRON_SECRET;
  
  // 如果没有设置密钥，允许本地开发
  if (!cronSecret) return true;
  
  return authHeader === `Bearer ${cronSecret}`;
};

export const GET: APIRoute = async ({ request }) => {
  // 验证请求来源
  if (!verifyCronSecret(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  try {
    const now = new Date().toISOString();
    
    // 查找所有到期的定时发布文章
    const scheduledArticles = await db
      .select()
      .from(articles)
      .where(
        and(
          eq(articles.status, 'scheduled'),
          isNotNull(articles.scheduledAt),
          lt(articles.scheduledAt, now)
        )
      );
    
    if (scheduledArticles.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No articles to publish',
        published: 0 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // 发布所有到期的文章
    let publishedCount = 0;
    const errors: string[] = [];
    
    for (const article of scheduledArticles) {
      try {
        await db
          .update(articles)
          .set({
            status: 'published',
            publishedAt: article.scheduledAt,
            updatedAt: now,
            scheduledAt: null,
          })
          .where(eq(articles.id, article.id));
        
        publishedCount++;
        console.log(`Published: ${article.title}`);
      } catch (error) {
        errors.push(`Failed to publish "${article.title}": ${error}`);
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Published ${publishedCount} article(s)`,
      published: publishedCount,
      errors: errors.length > 0 ? errors : undefined,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Cron publish error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// 也支持 POST 方法（某些 cron 服务使用 POST）
export const POST = GET;
