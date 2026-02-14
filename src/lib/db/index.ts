// src/lib/db/index.ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

// 本地 SQLite 数据库 - 使用绝对路径避免运行时路径问题
const dbPath = path.resolve(process.cwd(), 'data/local.db');
const sqlite = new Database(dbPath);

export const db = drizzle(sqlite, { schema });

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
