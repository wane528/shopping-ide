// src/pages/api/admin/login.ts
// 管理员登录 API

import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const password = formData.get('password') as string;
  
  // 从环境变量获取管理员密码
  const adminPassword = import.meta.env.ADMIN_PASSWORD || 'admin123';
  
  if (password === adminPassword) {
    // 设置登录 cookie（7天有效）
    cookies.set('admin_auth', 'true', {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: 'lax',
      secure: import.meta.env.PROD,
    });
    
    return redirect('/admin');
  }
  
  // 登录失败，重定向回登录页并显示错误
  return redirect('/admin/login?error=1');
};
