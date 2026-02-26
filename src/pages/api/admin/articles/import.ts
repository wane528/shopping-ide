// src/pages/api/admin/articles/import.ts
import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { articles, authors, categories, tags, articleTags } from '@lib/db/schema';
import { eq } from 'drizzle-orm';

export const prerender = false;

const checkAuth = (cookies: any) => {
  return cookies.get('admin_auth')?.value === 'true';
};

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function getOrCreateAuthor(authorName: string, authorSlug: string | null) {
  const slug = authorSlug || generateSlug(authorName);
  const existing = await db.select().from(authors).where(eq(authors.slug, slug));
  if (existing.length > 0) return existing[0].id;
  const result = await db.insert(authors).values({
    name: authorName,
    slug,
    bio: `${authorName} bio`,
    createdAt: new Date().toISOString(),
  }).returning();
  return result[0].id;
}

async function getOrCreateCategory(categorySlug: string, categoryName?: string) {
  const existing = await db.select().from(categories).where(eq(categories.slug, categorySlug));
  if (existing.length > 0) return categorySlug;
  await db.insert(categories).values({
    name: categoryName || categorySlug,
    slug: categorySlug,
    description: `${categoryName || categorySlug} category`,
    color: 'blue',
    order: 0,
  });
  return categorySlug;
}

async function getOrCreateTag(tagName: string): Promise<number> {
  const slug = generateSlug(tagName);
  const existing = await db.select().from(tags).where(eq(tags.slug, slug));
  if (existing.length > 0) return existing[0].id;
  const result = await db.insert(tags).values({ name: tagName, slug }).returning();
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
      importData = await request.json();
    } else {
      // multipart form-data
      const formData = await request.formData();
      const file = formData.get('file') as File;
      if (!file) {
        return new Response(JSON.stringify({ error: 'No file provided' }), {
          status: 400, headers: { 'Content-Type': 'application/json' },
        });
      }
      const text = await file.text();
      if (!text || text.trim() === '') {
        return new Response(JSON.stringify({ error: 'File is empty' }), {
          status: 400, headers: { 'Content-Type': 'application/json' },
        });
      }
      if (file.name.endsWith('.json')) {
        importData = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        importData = lines.slice(1).filter(l => l.trim()).map(line => {
          const values = line.split(',');
          const obj: any = {};
          headers.forEach((h, i) => { obj[h.trim()] = values[i]?.trim().replace(/^"|"$/g, ''); });
          return obj;
        });
      } else {
        return new Response(JSON.stringify({ error: 'Unsupported file format' }), {
          status: 400, headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      created: { authors: [] as string[], categories: [] as string[], tags: [] as string[] },
    };

    for (const item of importData) {
      try {
        let authorId = null;
        if (item.authorName || item.author_name) {
          const name = item.authorName || item.author_name;
          authorId = await getOrCreateAuthor(name, item.authorSlug || item.author_slug || null);
          if (!results.created.authors.includes(name)) results.created.authors.push(name);
        }

        const categorySlug = item.category || 'guides';
        await getOrCreateCategory(categorySlug, item.categoryName || item.category_name);
        if (!results.created.categories.includes(categorySlug)) results.created.categories.push(categorySlug);

        const slug = item.slug || generateSlug(item.title || item.Title);
        const existing = await db.select().from(articles).where(eq(articles.slug, slug));
        if (existing.length > 0) {
          results.errors.push(`Slug "${slug}" already exists, skipped`);
          results.failed++;
          continue;
        }

        const content = item.content || item.Content || '';
        const wordCount = content.split(/\s+/).length;
        const readingTime = Math.max(1, Math.ceil(wordCount / 200));
        const now = new Date().toISOString();

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

        const tagNames = item.tags || item.Tags || [];
        const tagArray = typeof tagNames === 'string'
          ? tagNames.split(';').map((t: string) => t.trim()).filter(Boolean)
          : tagNames;

        for (const tagName of tagArray) {
          const tagId = await getOrCreateTag(tagName);
          await db.insert(articleTags).values({ articleId, tagId });
          if (!results.created.tags.includes(tagName)) results.created.tags.push(tagName);
        }

        results.success++;
      } catch (error) {
        console.error('Import item error:', error);
        results.failed++;
        results.errors.push(`Failed: ${item.title || 'Unknown'} - ${error}`);
      }
    }

    return new Response(JSON.stringify(results), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Import error:', error);
    return new Response(
      JSON.stringify({ error: 'Import failed', message: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
