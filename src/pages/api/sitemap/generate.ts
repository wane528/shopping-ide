// src/pages/api/sitemap/generate.ts
// 手动触发 sitemap 重新生成
// 调用方式: POST /api/sitemap/generate

import type { APIRoute } from 'astro';
import { generateAndUploadSitemap } from '@lib/sitemap';

export const prerender = false;

export const POST: APIRoute = async () => {
  const result = await generateAndUploadSitemap();

  if (!result.success) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
