// src/pages/api/admin/logout.ts
// 管理员登出 API

import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ cookies, redirect }) => {
  // 清除登录 cookie
  cookies.delete('admin_auth', { path: '/' });
  
  return redirect('/admin/login');
};
