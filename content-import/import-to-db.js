// 导入文章到数据库
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取生成的 JSON
const articles = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'articles-import.json'), 'utf-8')
);

console.log(`准备导入 ${articles.length} 篇文章...\n`);

// 使用 fetch 调用导入 API
async function importArticles() {
  try {
    // 创建 FormData
    const formData = new FormData();
    
    // 将 JSON 转换为 Blob 并添加到 FormData
    const blob = new Blob([JSON.stringify(articles)], { type: 'application/json' });
    const file = new File([blob], 'articles-import.json', { type: 'application/json' });
    formData.append('file', file);
    
    // 调用导入 API
    const response = await fetch('http://localhost:4321/api/admin/articles/import', {
      method: 'POST',
      body: formData,
      headers: {
        // Cookie 需要从浏览器获取，或者先登录
        'Cookie': 'admin_auth=true'
      }
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✓ 导入成功！\n');
      console.log(`成功: ${result.success} 篇`);
      console.log(`失败: ${result.failed} 篇\n`);
      
      if (result.created.authors.length > 0) {
        console.log(`新建作者: ${result.created.authors.join(', ')}`);
      }
      if (result.created.categories.length > 0) {
        console.log(`新建分类: ${result.created.categories.join(', ')}`);
      }
      if (result.created.tags.length > 0) {
        console.log(`新建标签: ${result.created.tags.join(', ')}`);
      }
      
      if (result.errors && result.errors.length > 0) {
        console.log(`\n错误信息:`);
        result.errors.forEach(err => console.log(`  - ${err}`));
      }
    } else {
      console.error('✗ 导入失败:', result.error || result.message);
    }
  } catch (error) {
    console.error('✗ 导入出错:', error.message);
    console.log('\n提示: 请确保:');
    console.log('1. 开发服务器正在运行 (npm run dev)');
    console.log('2. 已登录 admin 后台');
    console.log('3. 数据库连接正常');
  }
}

// 执行导入
importArticles();
