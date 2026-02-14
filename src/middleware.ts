// src/middleware.ts
// 后台认证中间件

import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;
  
  // 只对 /admin 路径进行认证检查，排除登录页和 API 路径
  if (pathname.startsWith('/admin') && 
      pathname !== '/admin/login' && 
      !pathname.startsWith('/api/')) {
    const isAuthenticated = context.cookies.get('admin_auth')?.value === 'true';
    
    if (!isAuthenticated) {
      return context.redirect('/admin/login');
    }
  }
  
  return next();
});
