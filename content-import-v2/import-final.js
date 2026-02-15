import { createPool } from '@vercel/postgres';
import fs from 'fs';

const envContent = fs.readFileSync('../.env', 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim().replace(/^[\"']|[\"']$/g, '');
    process.env[key] = value;
  }
});

const pool = createPool({ connectionString: process.env.POSTGRES_URL });

const articles = [
  {
    title: 'Best Kits for Long Cracks (2026)',
    slug: 'best-kits-long-cracks',
    description: 'Best repair kits for long cracks. Reviews and tips.',
    content: '# Best Kits for Long Cracks\n\nLong cracks need special kits.\n\n## Top 3\n\n1. Blue Star - .99\n2. Permatex Pro - .99\n3. 3M - .99\n\n## Success Rates\n\n- 6-8 inches: 60%\n- 8-10 inches: 40%\n- Over 10 inches: Need pro\n\n## Tips\n\n1. Use extra resin\n2. Work in sections\n3. Multiple applications\n4. Longer cure time\n\n---\n*Updated February 2026*',
    category: 'reviews',
    status: 'scheduled',
    metaTitle: 'Best Kits for Long Cracks 2026',
    metaDescription: 'Find the best kits for long cracks. Reviews and tips.',
    authorName: 'GoodSetup Team',
    tags: ['long cracks', 'reviews'],
    scheduledAt: '2026-02-27T10:00:00.000Z'
  },
  {
    title: 'DIY vs Professional Repair (2026)',
    slug: 'diy-vs-professional',
    description: 'Compare DIY and professional repair. Costs and quality.',
    content: '# DIY vs Professional\n\n## Cost\n\n**DIY**: -15\n**Pro**: -150\n**Savings**: -140\n\n## Quality\n\n**DIY**: 70-90% invisible\n**Pro**: 90-95% invisible\n\n## Time\n\n**DIY**: 45-100 min\n**Pro**: 60-105 min\n\n## Choose DIY if:\n\n- Small chip\n- Want to save money\n- Comfortable with DIY\n\n## Choose Pro if:\n\n- Large damage\n- Insurance covers\n- Want guarantee\n\n---\n*Updated February 2026*',
    category: 'guides',
    status: 'scheduled',
    metaTitle: 'DIY vs Professional Repair 2026',
    metaDescription: 'Compare DIY and professional repair. Make the right choice.',
    authorName: 'GoodSetup Team',
    tags: ['comparison', 'DIY'],
    scheduledAt: '2026-03-01T10:00:00.000Z'
  },
  {
    title: 'Where to Buy Repair Kits (2026)',
    slug: 'where-to-buy-kits',
    description: 'Best places to buy windshield repair kits. Price comparison.',
    content: '# Where to Buy\n\n## Online\n\n**Amazon**\n- Widest selection\n- Customer reviews\n- Prime shipping\n- Price: .99-24.99\n\n**eBay**\n- Competitive prices\n- Bulk deals\n- Price: .99-19.99\n\n## Auto Parts\n\n**AutoZone**\n- Expert advice\n- Same-day pickup\n- Price: .99-16.99\n\n**O\'Reilly**\n- Rewards program\n- Frequent sales\n- Price: .99-17.99\n\n## Big Box\n\n**Walmart**\n- Low prices\n- Easy returns\n- Price: .99-14.99\n\n**Target**\n- Convenient\n- RedCard discount\n- Price: .99-15.99\n\n## Tips\n\n1. Check multiple sources\n2. Look for coupons (20% off)\n3. Compare prices\n4. Read reviews\n\n---\n*Updated February 2026*',
    category: 'guides',
    status: 'scheduled',
    metaTitle: 'Where to Buy Windshield Repair Kits 2026',
    metaDescription: 'Best places to buy repair kits. Price comparison and tips.',
    authorName: 'GoodSetup Team',
    tags: ['buying guide', 'shopping'],
    scheduledAt: '2026-03-03T10:00:00.000Z'
  },
  {
    title: 'Windshield Repair FAQs (2026)',
    slug: 'windshield-repair-faqs',
    description: '10 most common questions about windshield repair kits answered.',
    content: '# Windshield Repair FAQs\n\n## 1. Do they really work?\n\nYes! 80-95% success rate when used correctly on appropriate damage.\n\n## 2. How long does repair last?\n\nLifetime of your windshield. Resin bonds permanently.\n\n## 3. Can I use on any damage?\n\nNo. Best for chips <1 inch and cracks <6 inches.\n\n## 4. How much do kits cost?\n\n-25, most quality kits -15.\n\n## 5. Is it difficult?\n\nNo. Follow instructions, takes 30-60 minutes.\n\n## 6. Can I drive after?\n\nWait 1 hour minimum, 24 hours best.\n\n## 7. Will insurance cover?\n\nMany policies cover with  deductible.\n\n## 8. What if it fails?\n\nTry again or seek professional help.\n\n## 9. Best kit for beginners?\n\nPermatex - easy to use, great results.\n\n## 10. Repair or replace?\n\nRepair if <6 inches, replace if >12 inches.\n\n---\n*Updated February 2026*',
    category: 'guides',
    status: 'scheduled',
    metaTitle: 'Windshield Repair FAQs 2026',
    metaDescription: '10 most common questions about windshield repair kits answered by experts.',
    authorName: 'GoodSetup Team',
    tags: ['FAQ', 'questions'],
    scheduledAt: '2026-03-05T10:00:00.000Z'
  },
  {
    title: 'Rain-X Repair Kit Instructions (2026)',
    slug: 'rain-x-instructions',
    description: 'Complete Rain-X windshield repair kit instructions. Step-by-step guide.',
    content: '# Rain-X Instructions\n\n## What\'s Included\n\n- Resin (0.6 oz)\n- Simple applicator\n- Curing film\n- Instructions\n\n## Steps\n\n### 1. Prepare\n- Clean windshield\n- Dry completely\n- Park in shade\n\n### 2. Apply\n- Position applicator\n- Fill with resin\n- Press firmly 2 minutes\n- Release slowly\n\n### 3. Cure\n- Apply curing film\n- Move to sunlight\n- Wait 30 minutes\n- Remove film\n\n### 4. Finish\n- Scrape excess\n- Clean area\n- Inspect\n\n## Tips\n\n- Warm resin first\n- Apply steady pressure\n- Full 30 min cure\n- Be gentle scraping\n\n## Troubleshooting\n\n**Won\'t stick**: Clean better\n**Bubbles**: More pressure\n**Cloudy**: Moisture present\n\n## vs Other Kits\n\n**Pros**:\n- Fastest cure (30 min)\n- Very easy\n- Affordable (.99)\n\n**Cons**:\n- Basic applicator\n- Less resin\n\n## Results\n\n- Small chips: 85% invisible\n- Success rate: 80%\n- Lasts: Lifetime\n\n---\n*Updated February 2026*',
    category: 'guides',
    status: 'scheduled',
    metaTitle: 'Rain-X Repair Kit Instructions 2026',
    metaDescription: 'Complete Rain-X instructions. Step-by-step guide with tips and troubleshooting.',
    authorName: 'GoodSetup Team',
    tags: ['rain-x', 'instructions', 'tutorial'],
    scheduledAt: '2026-03-07T10:00:00.000Z'
  }
];

async function importArticles() {
  for (const article of articles) {
    try {
      const authorResult = await pool.query('SELECT id FROM authors WHERE name = ', ['GoodSetup Team']);
      const authorId = authorResult.rows[0]?.id || 1;
      
      const wordCount = article.content.split(/\s+/).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));
      const now = new Date().toISOString();
      
      const result = await pool.query(
        'INSERT INTO articles (title, slug, description, content, category, status, featured, meta_title, meta_description, author_id, reading_time, scheduled_at, updated_at, created_at) VALUES (, , , , , , , , , , , , , ) RETURNING id',
        [article.title, article.slug, article.description, article.content, article.category, article.status, false, article.metaTitle, article.metaDescription, authorId, readingTime, article.scheduledAt, now, now]
      );
      
      console.log(' Imported:', article.title, '(ID:', result.rows[0].id, ')');
      
      for (const tagName of article.tags) {
        const slug = tagName.toLowerCase().replace(/\s+/g, '-');
        let tagResult = await pool.query('SELECT id FROM tags WHERE slug = ', [slug]);
        let tagId;
        if (tagResult.rows.length === 0) {
          tagResult = await pool.query('INSERT INTO tags (name, slug) VALUES (, ) RETURNING id', [tagName, slug]);
          tagId = tagResult.rows[0].id;
        } else {
          tagId = tagResult.rows[0].id;
        }
        await pool.query('INSERT INTO article_tags (article_id, tag_id) VALUES (, )', [result.rows[0].id, tagId]);
      }
    } catch (error) {
      console.error(' Failed:', article.title, error.message);
    }
  }
  await pool.end();
  console.log('\n All done!');
}

importArticles();
