import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createPool } from '@vercel/postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
});

const pool = createPool({ connectionString: process.env.POSTGRES_URL });

async function cleanup() {
  console.log('清理旧文章...');
  await pool.query('DELETE FROM article_tags');
  await pool.query('DELETE FROM articles');
  console.log('✓ 已清空 articles 和 article_tags 表');
  await pool.end();
}

cleanup().catch(console.error);
