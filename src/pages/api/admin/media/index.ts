// src/pages/api/admin/media/index.ts
// 媒体文件管理 API

import type { APIRoute } from 'astro';
import { mkdir, writeFile, readdir, unlink, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export const prerender = false;

// 媒体存储目录
const MEDIA_DIR = path.join(process.cwd(), 'public', 'uploads');

// 确保上传目录存在
async function ensureUploadDir() {
  if (!existsSync(MEDIA_DIR)) {
    await mkdir(MEDIA_DIR, { recursive: true });
  }
}

// 获取媒体文件列表
export const GET: APIRoute = async ({ url }) => {
  try {
    await ensureUploadDir();
    
    const files = await readdir(MEDIA_DIR);
    const mediaFiles = [];
    
    for (const file of files) {
      const filePath = path.join(MEDIA_DIR, file);
      const fileStat = await stat(filePath);
      
      if (fileStat.isFile()) {
        const ext = path.extname(file).toLowerCase();
        const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
        
        mediaFiles.push({
          id: file,
          name: file,
          url: `/uploads/${file}`,
          type: isImage ? 'image' : 'file',
          size: formatFileSize(fileStat.size),
          date: fileStat.mtime.toISOString().split('T')[0],
        });
      }
    }
    
    // 按日期降序排序
    mediaFiles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return new Response(
      JSON.stringify({ files: mediaFiles }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error listing media:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to list media files' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// 上传文件
export const POST: APIRoute = async ({ request }) => {
  try {
    await ensureUploadDir();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 生成唯一文件名
    const ext = path.extname(file.name);
    const baseName = path.basename(file.name, ext);
    const timestamp = Date.now();
    const fileName = `${baseName}-${timestamp}${ext}`;
    const filePath = path.join(MEDIA_DIR, fileName);
    
    // 写入文件
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        file: {
          id: fileName,
          name: fileName,
          url: `/uploads/${fileName}`,
          type: isImageFile(ext) ? 'image' : 'file',
          size: formatFileSize(file.size),
          date: new Date().toISOString().split('T')[0],
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error uploading file:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to upload file' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// 删除文件
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { fileName } = await request.json();
    
    if (!fileName) {
      return new Response(
        JSON.stringify({ error: 'No file name provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const filePath = path.join(MEDIA_DIR, fileName);
    
    // 安全检查：确保文件在上传目录内
    if (!filePath.startsWith(MEDIA_DIR)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file path' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deleting file:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete file' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

function isImageFile(ext: string): boolean {
  return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext.toLowerCase());
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
