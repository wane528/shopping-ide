// src/pages/api/admin/articles/import.ts
// 导入文章数据（支持自动创建分类/标签/作者）

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { articles, authors, categories, tags, articleTags } from '@lib/db/schema';
import { eq } from 'drizzle-orm';

export const prerender = false;

const checkAuth = (cookies: any) => {
  return cookies.get('admin_auth')?.value === 'true';
};

// 生成 slug
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// 获取或创建作者
async function getOrCreateAuthor(authorName: string | null, authorSlug: string | null) {
  if (!authorName) return null;
  
  const slug = authorSlug || generateSlug(authorName);
  
  // 检查作者是否存在
  const existing = await db.select().from(authors).where(eq(authors.slug, slug));
  if (existing.length > 0) {
    return existing[0].id;
  }
  
  // 创建新作者
  const result = await db.insert(authors).values({
    name: authorName,
    slug,
    bio: `${authorName} 的个人简介`,
    createdAt: new Date().toISOString(),
  }).returning();
  
  return result[0].id;
}

// 获取或创建分类
async function getOrCreateCategory(categorySlug: string, categoryName?: string) {
  // 检查分类是否存在
  const existing = await db.select().from(categories).where(eq(categories.slug, categorySlug));
  if (existing.length > 0) {
    return categorySlug;
  }
  
  // 创建新分类
  await db.insert(categories).values({
    name: categoryName || categorySlug,
    slug: categorySlug,
    description: `${categoryName || categorySlug} 分类`,
    color: 'blue',
    order: 0,
  });
  
  return categorySlug;
}

// 获取或创建标签
async function getOrCreateTag(tagName: string): Promise<number> {
  const slug = generateSlug(tagName);
  
  // 检查标签是否存在
  const existing = await db.select().from(tags).where(eq(tags.slug, slug));
  if (existing.length > 0) {
    return existing[0].id;
  }
  
  // 创建新标签
  const result = await db.insert(tags).values({
    name: tagName,
    slug,
  }).returning();
  
  return result[0].id;
}

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!checkAuth(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    let importData: any[];
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      // Direct JSON body
      importData = await request.json();
    } else {
      // multipart/form-data file upload
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return new Response(
          JSON.stringify({ error: 'No file provided' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const content = await file.text();
      if (!content || content.trim() === '') {
        return new Response(
          JSON.stringify({ error: 'File is empty' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (file.name.endsWith('.json')) {
        importData = JSON.parse(content);
      } else if (file.name.endsWith('.csv')) {
        const lines = content.split('\n');
        const headers = lines[0].split(',');
        importData = lines.slice(1).filter(l => l.trim()).map(line => {
          const values = line.split(',');
          const obj: any = {};
          headers.forEach((header, i) => {
            obj[header.trim()] = values[i]?.trim().replace(/^"|"$/g, '');
          });
          return obj;
        });
      } else {
        return new Response(
          JSON.stringify({ error: 'Unsupported file format' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      created: {
        authors: [] as string[],
        categories: [] as string[],
        tags: [] as string[],
      },
    };

    // 导入每篇文章
    for (const item of importData) {
      try {
        // 处理作者
        let authorId = null;
        if (item.authorName || item.author_name) {
          const authorName = item.authorName || item.author_name;
          const authorSlug = item.authorSlug || item.author_slug;
          authorId = await getOrCreateAuthor(authorName, authorSlug);
          if (!results.created.authors.includes(authorName)) {
            results.created.authors.push(authorName);
          }
        }

        // 处理分类
        const categorySlug = item.category || 'guides';
        const categoryName = item.categoryName || item.category_name;
        await getOrCreateCategory(categorySlug, categoryName);
        if (!results.created.categories.includes(categorySlug)) {
          results.created.categories.push(categorySlug);
        }

        // 检查 slug 是否已存在
        const slug = item.slug || generateSlug(item.title || item.Title);
        const existing = await db.select().from(articles).where(eq(articles.slug, slug));
        
        if (existing.length > 0) {
          results.errors.push(`文章 "${item.title || item.Title}" 的 slug "${slug}" 已存在，跳过`);
          results.failed++;
          continue;
        }

        // 计算阅读时长
        const content = item.content || item.Content || '';
        const wordCount = content.split(/\s+/).length;
        const readingTime = Math.max(1, Math.ceil(wordCount / 200));

        const now = new Date().toISOString();

        // 插入文章
        const insertResult = await db.insert(articles).values({
          title: item.title || item.Title,
          slug,
          description: item.description || item.Description || '',
          content,
          category: categorySlug,
          status: item.status || item.Status || 'draft',
          featured: item.featured === true || item.Featured === 'true',
          heroImage: item.heroImage || item.hero_image || null,
          metaTitle: item.metaTitle || item.meta_title || null,
          metaDescription: item.metaDescription || item.meta_description || null,
          canonical: item.canonical || null,
          noindex: item.noindex === true || item.noindex === 'true',
          authorId,
          publishedAt: item.publishedAt || item.published_at || (item.status === 'published' ? now : null),
          scheduledAt: item.scheduledAt || item.scheduled_at || null,
          updatedAt: now,
          createdAt: item.createdAt || item.created_at || now,
          readingTime,
          faqJson: item.faqJson || item.faq_json || null,
          speakableContent: item.speakableContent || item.speakable_content || null,
        }).returning();

        const articleId = insertResult[0].id;

        // 处理标签
        const tagNames = item.tags || item.Tags || [];
        const tagArray = typeof tagNames === 'string' 
          ? tagNames.split(';').map((t: string) => t.trim()).filter(Boolean)
          : tagNames;

        for (const tagName of tagArray) {
          const tagId = await getOrCreateTag(tagName);
          await db.insert(articleTags).values({
            articleId,
            tagId,
          });
          if (!results.created.tags.includes(tagName)) {
            results.created.tags.push(tagName);
          }
        }

        results.success++;
      } catch (error) {
        console.error('Import item error:', error);
        results.failed++;
        results.errors.push(`导入失败: ${item.title || 'Unknown'} - ${error}`);
      }
    }

    return new Response(
      JSON.stringify(results),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Import error:', error);
    return new Response(
      JSON.stringify({ error: 'Import failed', message: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
