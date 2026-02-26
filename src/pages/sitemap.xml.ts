// src/pages/sitemap.xml.ts
// 代理 Supabase Storage 上的静态 sitemap（备用入口）
import type { APIRoute } from 'astro';

export const prerender = false;

const SITEMAP_URL = 'https://hyqfwrozcxrenzaoeyrz.supabase.co/storage/v1/object/public/media/sitemap.xml';

export const GET: APIRoute = async () => {
  try {
    const res = await fetch(SITEMAP_URL);
    if (!res.ok) {
      // 如果 Supabase 上还没有 sitemap，返回一个基础版本
      const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.puracatcare.help/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`;
      return new Response(fallback, {
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
      });
    }
    const xml = await res.text();
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch {
    return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }
};
