// 直接导入文章到数据库（绕过 API）
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createPool } from '@vercel/postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 手动读取 .env 文件
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    // 移除引号
    value = value.replace(/^["']|["']$/g, '');
    envVars[key] = value;
    process.env[key] = value;
  }
});

// 读取环境变量
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('错误: 未找到数据库连接字符串');
  console.error('请确保 .env 文件中设置了 POSTGRES_URL 或 DATABASE_URL');
  process.exit(1);
}

// 创建数据库连接
const pool = createPool({ connectionString });

// 读取文章数据
const articles = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'articles-import.json'), 'utf-8')
);

console.log(`准备导入 ${articles.length} 篇文章...\n`);

// 生成 slug
function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// 获取或创建作者
async function getOrCreateAuthor(authorName, authorSlug) {
  if (!authorName) return null;
  
  const slug = authorSlug || generateSlug(authorName);
  
  // 检查作者是否存在
  const checkResult = await pool.query(
    'SELECT id FROM authors WHERE slug = $1',
    [slug]
  );
  
  if (checkResult.rows.length > 0) {
    return checkResult.rows[0].id;
  }
  
  // 创建新作者
  const insertResult = await pool.query(
    `INSERT INTO authors (name, slug, bio, created_at) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id`,
    [authorName, slug, `${authorName} 的个人简介`, new Date().toISOString()]
  );
  
  console.log(`  ✓ 创建作者: ${authorName}`);
  return insertResult.rows[0].id;
}

// 获取或创建分类
async function getOrCreateCategory(categorySlug, categoryName) {
  // 检查分类是否存在
  const checkResult = await pool.query(
    'SELECT slug FROM categories WHERE slug = $1',
    [categorySlug]
  );
  
  if (checkResult.rows.length > 0) {
    return categorySlug;
  }
  
  // 创建新分类
  await pool.query(
    `INSERT INTO categories (name, slug, description, color, "order") 
     VALUES ($1, $2, $3, $4, $5)`,
    [categoryName || categorySlug, categorySlug, `${categoryName || categorySlug} 分类`, 'blue', 0]
  );
  
  console.log(`  ✓ 创建分类: ${categorySlug}`);
  return categorySlug;
}

// 获取或创建标签
async function getOrCreateTag(tagName) {
  const slug = generateSlug(tagName);
  
  // 检查标签是否存在
  const checkResult = await pool.query(
    'SELECT id FROM tags WHERE slug = $1',
    [slug]
  );
  
  if (checkResult.rows.length > 0) {
    return checkResult.rows[0].id;
  }
  
  // 创建新标签
  const insertResult = await pool.query(
    'INSERT INTO tags (name, slug) VALUES ($1, $2) RETURNING id',
    [tagName, slug]
  );
  
  console.log(`  ✓ 创建标签: ${tagName}`);
  return insertResult.rows[0].id;
}

// 导入文章
async function importArticles() {
  let successCount = 0;
  let failCount = 0;
  const errors = [];
  
  for (const article of articles) {
    try {
      console.log(`\n导入: ${article.title.substring(0, 60)}...`);
      
      // 处理作者
      const authorId = await getOrCreateAuthor(article.authorName, article.authorSlug);
      
      // 处理分类
      await getOrCreateCategory(article.category, article.categoryName);
      
      // 检查 slug 是否已存在
      const existingCheck = await pool.query(
        'SELECT id FROM articles WHERE slug = $1',
        [article.slug]
      );
      
      if (existingCheck.rows.length > 0) {
        console.log(`  ⚠ 跳过: slug "${article.slug}" 已存在`);
        failCount++;
        errors.push(`文章 "${article.title}" 的 slug 已存在`);
        continue;
      }
      
      // 计算阅读时长
      const wordCount = article.content.split(/\s+/).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));
      
      const now = new Date().toISOString();
      
      // 插入文章
      const insertResult = await pool.query(
        `INSERT INTO articles (
          title, slug, description, content, category, status, featured,
          hero_image, meta_title, meta_description, canonical, noindex,
          author_id, reading_time, scheduled_at, published_at, updated_at, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING id`,
        [
          article.title,
          article.slug,
          article.description,
          article.content,
          article.category,
          article.status || 'draft',
          article.featured || false,
          article.heroImage || null,
          article.metaTitle || null,
          article.metaDescription || null,
          article.canonical || null,
          article.noindex || false,
          authorId,
          readingTime,
          article.scheduledAt || null,
          article.status === 'published' ? now : null,
          now,
          article.createdAt || now
        ]
      );
      
      const articleId = insertResult.rows[0].id;
      
      // 处理标签
      if (article.tags && article.tags.length > 0) {
        for (const tagName of article.tags) {
          const tagId = await getOrCreateTag(tagName);
          await pool.query(
            'INSERT INTO article_tags (article_id, tag_id) VALUES ($1, $2)',
            [articleId, tagId]
          );
        }
      }
      
      console.log(`  ✓ 成功导入 (ID: ${articleId})`);
      if (article.scheduledAt) {
        const scheduleDate = new Date(article.scheduledAt);
        console.log(`  📅 定时发布: ${scheduleDate.toLocaleString('zh-CN')}`);
      }
      
      successCount++;
    } catch (error) {
      console.error(`  ✗ 失败:`, error.message);
      failCount++;
      errors.push(`${article.title}: ${error.message}`);
    }
  }
  
  // 输出总结
  console.log(`\n${'='.repeat(60)}`);
  console.log(`导入完成！`);
  console.log(`成功: ${successCount} 篇`);
  console.log(`失败: ${failCount} 篇`);
  
  if (errors.length > 0) {
    console.log(`\n错误列表:`);
    errors.forEach(err => console.log(`  - ${err}`));
  }
  
  // 关闭连接
  await pool.end();
}

// 执行导入
importArticles().catch(error => {
  console.error('导入过程出错:', error);
  process.exit(1);
});
