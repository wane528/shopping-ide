// scripts/cleanup-articles.ts
// 清理测试数据，保留 windshield repair kit 文章

import { db } from '../src/lib/db/index.js';
import { articles, articleTags } from '../src/lib/db/schema.js';
import { eq } from 'drizzle-orm';

async function cleanup() {
  console.log('🔍 查询所有文章...');
  
  const all = await db.select().from(articles);
  console.log('当前文章:');
  all.forEach(a => {
    console.log(`  - ID: ${a.id}, Slug: ${a.slug}, Status: ${a.status}`);
  });
  
  // 保留 windshield-repair-kit-complete-guide，删除其他
  const keepSlug = 'windshield-repair-kit-complete-guide';
  const toDelete = all.filter(a => a.slug !== keepSlug);
  
  if (toDelete.length === 0) {
    console.log('✅ 没有需要删除的文章');
    return;
  }
  
  console.log(`\n📝 将删除 ${toDelete.length} 篇文章:`);
  toDelete.forEach(a => {
    console.log(`  - ${a.title}`);
  });
  
  // 删除文章标签关联
  for (const article of toDelete) {
    await db.delete(articleTags).where(eq(articleTags.articleId, article.id));
  }
  console.log('✅ 已删除文章标签关联');
  
  // 删除文章
  for (const article of toDelete) {
    await db.delete(articles).where(eq(articles.id, article.id));
  }
  console.log('✅ 已删除测试文章');
  
  // 验证
  const remaining = await db.select().from(articles);
  console.log(`\n📊 剩余 ${remaining.length} 篇文章:`);
  remaining.forEach(a => {
    console.log(`  - ${a.title} (${a.slug})`);
  });
  
  console.log('\n🎉 清理完成！');
}

cleanup().catch(console.error);
