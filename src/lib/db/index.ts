// src/lib/db/index.ts
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { createPool } from '@vercel/postgres';
import * as schema from './schema';

// 获取数据库连接字符串
const connectionString = 
  process.env.POSTGRES_URL || 
  process.env.DATABASE_URL || 
  import.meta.env.POSTGRES_URL || 
  import.meta.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Missing database connection string. Please set POSTGRES_URL or DATABASE_URL in .env file');
}

// 创建连接池
const pool = createPool({ connectionString });

// 使用 Vercel Postgres/Supabase
export const db = drizzle(pool, { schema });

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
