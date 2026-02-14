// src/pages/api/articles/[slug].ts
// 单篇文章 API

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { articles, authors } from '@lib/db/schema';
import { eq, and } from 'drizzle-orm';

// 标记为 SSR 端点（不在构建时预渲染）
export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  try {
    const { slug } = params;

    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Slug is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 查询文章
    const result = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        description: articles.description,
        content: articles.content,
        category: articles.category,
        heroImage: articles.heroImage,
        publishedAt: articles.publishedAt,
        updatedAt: articles.updatedAt,
        readingTime: articles.readingTime,
        featured: articles.featured,
        metaTitle: articles.metaTitle,
        metaDescription: articles.metaDescription,
        faqJson: articles.faqJson,
        speakableContent: articles.speakableContent,
        author: {
          id: authors.id,
          name: authors.name,
          slug: authors.slug,
          bio: authors.bio,
          avatar: authors.avatar,
          expertise: authors.expertise,
        },
      })
      .from(articles)
      .leftJoin(authors, eq(articles.authorId, authors.id))
      .where(and(eq(articles.slug, slug), eq(articles.status, 'published')))
      .limit(1);

    if (result.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Article not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const article = result[0];

    return new Response(
      JSON.stringify({ article }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=600, stale-while-revalidate=3600',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching article:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch article' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export function getStaticPaths() {
  return [];
}
