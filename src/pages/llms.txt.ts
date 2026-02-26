// src/pages/llms.txt.ts
// AI 搜索友好的站点描述文件

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { articles } from '@lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export const prerender = false;

export const GET: APIRoute = async () => {
  const siteUrl = 'https://www.puracatcare.help';

  let articleList = '';
  try {
    const publishedArticles = await db
      .select()
      .from(articles)
      .where(eq(articles.status, 'published'))
      .orderBy(desc(articles.publishedAt));

    if (publishedArticles.length > 0) {
      articleList = publishedArticles
        .map(a => `- [${a.title}](${siteUrl}/${a.slug}): ${a.description}`)
        .join('\n');
    }
  } catch (error) {
    console.error('Error fetching articles for llms.txt:', error);
  }

  const llmsTxt = `# PuraCatCare

> Pure science for cat health — evidence-based guides on feline urinary and kidney health.

## About

PuraCatCare is an educational website providing veterinary-informed content about cat urinary tract health, chronic kidney disease (CKD), prescription diet reviews, and daily care tips. All content is reviewed by veterinary professionals and includes medical disclaimers.

- URL: ${siteUrl}
- Language: English
- Topics: Feline urinary health, kidney disease, FLUTD, prescription diets, cat nutrition
- Content type: Long-form guides, product reviews, care tips
- Audience: Cat owners seeking evidence-based health information

## Published Articles

${articleList || 'No articles published yet.'}

## Content Categories

- **Urinary Health**: Feline Lower Urinary Tract Disease (FLUTD), UTIs, crystals, bladder stones, urethral obstruction
- **Kidney Disease**: Chronic Kidney Disease (CKD) stages, IRIS staging, treatment, subcutaneous fluids, home care
- **Reviews**: Prescription urinary diets (Hill's c/d, Royal Canin Urinary SO, Purina UR), hydration supplements (Hydra Care), water fountains
- **Care Tips**: Hydration strategies, litter box management, stress reduction, diet transition guides

## Key Facts

- FLUTD affects 1-3% of cats seen by vets annually
- Male cats are at higher risk for urethral obstruction due to narrower urethra
- CKD affects approximately 30-40% of cats over age 10
- Wet food (75-80% moisture) is strongly preferred over dry food (10% moisture) for urinary health
- Prescription urinary diets can dissolve struvite stones in as little as 7-27 days

## Contact

- Email: hello@puracatcare.help
`;

  return new Response(llmsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
    },
  });
};
