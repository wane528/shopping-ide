// src/lib/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// 使用 Supabase Postgres
// 优先使用非池化连接以避免 SSL 问题
const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('POSTGRES_URL or DATABASE_URL environment variable is required');
}

// 配置 SSL
// Supabase 需要 SSL 连接，但可能使用自签名证书
const sslConfig = process.env.NODE_ENV === 'production'
  ? { rejectUnauthorized: false }
  : false;

const pool = new Pool({
  connectionString,
  ssl: sslConfig,
});

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
