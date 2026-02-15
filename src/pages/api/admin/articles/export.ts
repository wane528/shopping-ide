// src/pages/api/admin/articles/export.ts
// 导出文章数据

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { articles, authors, categories, tags, articleTags } from '@lib/db/schema';
import { eq } from 'drizzle-orm';

export const prerender = false;

const checkAuth = (cookies: any) => {
  return cookies.get('admin_auth')?.value === 'true';
};

export const GET: APIRoute = async ({ cookies, url }) => {
  if (!checkAuth(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const format = url.searchParams.get('format') || 'json';
    
    // 获取所有文章
    const allArticles = await db.select().from(articles);
    
    // 获取所有作者
    const allAuthors = await db.select().from(authors);
    const authorMap = new Map(allAuthors.map(a => [a.id, a]));
    
    // 获取所有分类
    const allCategories = await db.select().from(categories);
    const categoryMap = new Map(allCategories.map(c => [c.slug, c]));
    
    // 获取所有标签关联
    const allArticleTags = await db.select().from(articleTags);
    const allTags = await db.select().from(tags);
    const tagMap = new Map(allTags.map(t => [t.id, t]));
    
    // 构建文章数据（包含关联信息）
    const exportData = allArticles.map(article => {
      const author = article.authorId ? authorMap.get(article.authorId) : null;
      const category = categoryMap.get(article.category);
      const articleTagIds = allArticleTags
        .filter(at => at.articleId === article.id)
        .map(at => at.tagId);
      const articleTagNames = articleTagIds
        .map(id => tagMap.get(id)?.name)
        .filter(Boolean);
      
      return {
        id: article.id,
        title: article.title,
        slug: article.slug,
        description: article.description,
        content: article.content,
        category: article.category,
        categoryName: category?.name || article.category,
        status: article.status,
        featured: article.featured,
        heroImage: article.heroImage,
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
        canonical: article.canonical,
        noindex: article.noindex,
        authorId: article.authorId,
        authorName: author?.name || null,
        authorSlug: author?.slug || null,
        tags: articleTagNames,
        publishedAt: article.publishedAt,
        scheduledAt: article.scheduledAt,
        updatedAt: article.updatedAt,
        createdAt: article.createdAt,
        readingTime: article.readingTime,
        faqJson: article.faqJson,
        speakableContent: article.speakableContent,
      };
    });

    if (format === 'csv') {
      // CSV 格式
      const headers = [
        'ID', 'Title', 'Slug', 'Description', 'Content', 'Category', 
        'Status', 'Featured', 'Hero Image', 'Meta Title', 'Meta Description',
        'Author Name', 'Tags', 'Published At', 'Scheduled At', 'Created At'
      ];
      
      const csvRows = [
        headers.join(','),
        ...exportData.map(article => [
          article.id,
          `"${article.title.replace(/"/g, '""')}"`,
          article.slug,
          `"${article.description.replace(/"/g, '""')}"`,
          `"${article.content.replace(/"/g, '""')}"`,
          article.category,
          article.status,
          article.featured,
          article.heroImage || '',
          article.metaTitle || '',
          article.metaDescription || '',
          article.authorName || '',
          `"${article.tags.join(';')}"`,
          article.publishedAt || '',
          article.scheduledAt || '',
          article.createdAt || '',
        ].join(','))
      ];
      
      const csv = csvRows.join('\n');
      
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="articles-${Date.now()}.csv"`,
        },
      });
    } else {
      // JSON 格式
      const json = JSON.stringify(exportData, null, 2);
      
      return new Response(json, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="articles-${Date.now()}.json"`,
        },
      });
    }
  } catch (error) {
    console.error('Export error:', error);
    return new Response(
      JSON.stringify({ error: 'Export failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
