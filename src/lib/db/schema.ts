// src/lib/db/schema.ts
import { pgTable, text, integer, boolean, serial } from 'drizzle-orm/pg-core';

// 文章表
export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  content: text('content').notNull(),
  category: text('category').notNull(), // guides | reviews | tips | resources

  // SEO 字段
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  canonical: text('canonical'),
  noindex: boolean('noindex').default(false),

  // 媒体
  heroImage: text('hero_image'),

  // 作者
  authorId: integer('author_id').references(() => authors.id),

  // 时间戳
  publishedAt: text('published_at'),
  updatedAt: text('updated_at'),
  createdAt: text('created_at').default(new Date().toISOString()),

  // 状态
  status: text('status').default('draft'), // draft | published | scheduled
  featured: boolean('featured').default(false),

  // 定时发布
  scheduledAt: text('scheduled_at'), // 定时发布时间 (ISO 8601)

  // AI 搜索优化字段
  faqJson: text('faq_json'), // FAQ 结构化数据 JSON
  speakableContent: text('speakable_content'), // 语音搜索优化内容

  // 阅读时长（分钟）
  readingTime: integer('reading_time'),
});

// 作者表
export const authors = pgTable('authors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  bio: text('bio'),
  avatar: text('avatar'),

  // E-E-A-T 信号
  expertise: text('expertise'), // 专业领域（JSON 数组）
  credentials: text('credentials'), // 资质证书
  socialLinks: text('social_links'), // JSON 格式社交链接

  createdAt: text('created_at').default(new Date().toISOString()),
});

// 分类表
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  color: text('color').default('blue'),
  order: integer('order').default(0),
});

// 标签表
export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
});

// 文章-标签关联表
export const articleTags = pgTable('article_tags', {
  articleId: integer('article_id').references(() => articles.id).notNull(),
  tagId: integer('tag_id').references(() => tags.id).notNull(),
});

// Newsletter 订阅表
export const subscribers = pgTable('subscribers', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  subscribedAt: text('subscribed_at').default(new Date().toISOString()),
  status: text('status').default('active'), // active | unsubscribed
});

// 类型导出
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type Author = typeof authors.$inferSelect;
export type NewAuthor = typeof authors.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type Subscriber = typeof subscribers.$inferSelect;
