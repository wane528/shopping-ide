// 将所有 scheduled 文章改为 published
import { db } from '../src/lib/db/index';
import { articles } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

async function publishAllArticles() {
  try {
    console.log('Fetching scheduled articles...');
    
    const scheduledArticles = await db
      .select()
      .from(articles)
      .where(eq(articles.status, 'scheduled'));
    
    console.log(`Found ${scheduledArticles.length} scheduled articles`);
    
    if (scheduledArticles.length === 0) {
      console.log('No scheduled articles to publish');
      return;
    }
    
    const now = new Date().toISOString();
    
    for (const article of scheduledArticles) {
      console.log(`Publishing: ${article.title}`);
      
      await db
        .update(articles)
        .set({
          status: 'published',
          publishedAt: article.scheduledAt || now,
          updatedAt: now,
        })
        .where(eq(articles.id, article.id));
    }
    
    console.log(`✓ Successfully published ${scheduledArticles.length} articles`);
  } catch (error) {
    console.error('Error publishing articles:', error);
    process.exit(1);
  }
}

publishAllArticles();
