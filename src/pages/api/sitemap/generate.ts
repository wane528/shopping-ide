// src/pages/api/sitemap/generate.ts
// 生成 sitemap 并上传到 Supabase Storage 作为静态文件备份
// 调用方式: POST /api/sitemap/generate

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { articles } from '@lib/db/schema';
import { eq } from 'drizzle-orm';
import { supabase, STORAGE_BUCKET } from '@lib/supabase';

export const prerender = false;

export const POST: APIRoute = async () => {
  try {
    const siteUrl = 'https://www.puracatcare.help';
    const now = new Date().toISOString().split('T')[0];

    const staticPages = [
      { loc: '/', changefreq: 'daily', priority: 1.0, lastmod: now },
      { loc: '/about', changefreq: 'monthly', priority: 0.5, lastmod: now },
      { loc: '/category/urinary-health', changefreq: 'daily', priority: 0.8, lastmod: now },
      { loc: '/category/kidney-disease', changefreq: 'daily', priority: 0.8, lastmod: now },
      { loc: '/category/reviews', changefreq: 'daily', priority: 0.8, lastmod: now },
      { loc: '/category/care-tips', changefreq: 'daily', priority: 0.8, lastmod: now },
    ];

    const publishedArticles = await db
      .select()
      .from(articles)
      .where(eq(articles.status, 'published'));

    const articlePages = publishedArticles.map(article => {
      const dateToUse = article.updatedAt || article.publishedAt || article.createdAt;
      const lastmod = dateToUse ? dateToUse.split('T')[0] : now;
      return {
        loc: `/${article.slug}`,
        changefreq: 'monthly',
        priority: article.featured ? 0.9 : 0.8,
        lastmod,
      };
    });

    const allPages = [...staticPages, ...articlePages];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${siteUrl}${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    // 上传到 Supabase Storage
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload('sitemap.xml', sitemap, {
        contentType: 'application/xml',
        upsert: true,
      });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl('sitemap.xml');

    return new Response(JSON.stringify({
      success: true,
      urls: allPages.length,
      publicUrl,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message }), { status: 500 });
  }
};
