// Redirect old sitemap-index.xml to sitemap.xml
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  return new Response(null, {
    status: 301,
    headers: {
      Location: '/sitemap.xml',
    },
  });
};
