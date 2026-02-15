// src/lib/db/index.ts
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from './schema';

// 使用 Vercel Postgres/Supabase
export const db = drizzle(sql, { schema });

// 辅助函数：获取所有已发布文章
export async function getPublishedArticles() {
  return db.select().from(schema.articles).where(eq(schema.articles.status, 'published'));
}

// 辅助函数：根据 slug 获取文章
export async function getArticleBySlug(slug: string) {
  const result = await db.select().from(schema.articles).where(eq(schema.articles.slug, slug));
  return result[0];
}

// 导出 eq 函数
import { eq } from 'drizzle-orm';
