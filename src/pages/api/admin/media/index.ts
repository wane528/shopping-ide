// src/pages/api/admin/media/index.ts
// 媒体文件管理 API - 使用 Supabase Storage

import type { APIRoute } from 'astro';
import { supabase, STORAGE_BUCKET } from '../../../../lib/supabase';

export const prerender = false;

// 确保 bucket 存在
async function ensureBucket() {
  const { data } = await supabase.storage.getBucket(STORAGE_BUCKET);
  if (!data) {
    await supabase.storage.createBucket(STORAGE_BUCKET, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    });
  }
}

// 获取媒体文件列表
export const GET: APIRoute = async () => {
  try {
    await ensureBucket();

    const { data: files, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list('', { limit: 200, sortBy: { column: 'created_at', order: 'desc' } });

    if (error) {
      console.error('Supabase storage list error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to list media files', detail: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { data: { publicUrl: baseUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl('');

    const mediaFiles = (files || [])
      .filter((f: any) => f.name && !f.name.startsWith('.'))
      .map((f: any) => {
        const ext = f.name.split('.').pop()?.toLowerCase() || '';
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
        return {
          id: f.name,
          name: f.name,
          url: `${baseUrl}${f.name}`,
          type: isImage ? 'image' : 'file',
          size: formatFileSize(f.metadata?.size || 0),
          date: f.created_at || '',
        };
      });

    return new Response(
      JSON.stringify({ files: mediaFiles }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error listing media:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to list media files', detail: error?.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// 上传文件
export const POST: APIRoute = async ({ request }) => {
  try {
    await ensureBucket();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 生成唯一文件名
    const ext = file.name.split('.').pop() || '';
    const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = Date.now();
    const fileName = `${baseName}-${timestamp}.${ext}`;

    const buffer = await file.arrayBuffer();

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to upload file', detail: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext.toLowerCase());

    return new Response(
      JSON.stringify({
        success: true,
        file: {
          id: fileName,
          name: fileName,
          url: publicUrl,
          type: isImage ? 'image' : 'file',
          size: formatFileSize(file.size),
          date: new Date().toISOString().split('T')[0],
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to upload file', detail: error?.message }),
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

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([fileName]);

    if (error) {
      console.error('Supabase delete error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to delete file', detail: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error deleting file:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete file', detail: error?.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
