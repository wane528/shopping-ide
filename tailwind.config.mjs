/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      // ─────────────────────────────────────────────
      // Typography
      // ─────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        'display': ['40px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'h1': ['32px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'h2': ['24px', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'h3': ['20px', { lineHeight: '1.3' }],
        'h4': ['18px', { lineHeight: '1.4' }],
        'body-l': ['16px', { lineHeight: '1.7' }],
        'body-m': ['15px', { lineHeight: '1.7' }],
        'body-s': ['14px', { lineHeight: '1.6' }],
        'caption': ['12px', { lineHeight: '1.5' }],
      },
      
      // ─────────────────────────────────────────────
      // Color System - Primary (Green)
      // 为什么用绿色：转化率高、购买暗示自然、不攻击性强
      // ─────────────────────────────────────────────
      colors: {
        primary: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',  // 主按钮
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        
        // Neutral Gray - 专业灰阶
        gray: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
          950: '#09090B',
        },
        
        // Semantic Colors
        success: '#16A34A',
        warning: '#F59E0B',
        error: '#DC2626',
        info: '#2563EB',
      },
      
      // ─────────────────────────────────────────────
      // Background System
      // ─────────────────────────────────────────────
      backgroundColor: {
        'base': '#FAFAFA',
        'card': '#FFFFFF',
        'muted': '#F4F4F5',
        'hover': '#ECFDF5',
        'cta': '#10B981',
      },
      
      // ─────────────────────────────────────────────
      // Border System
      // ─────────────────────────────────────────────
      borderColor: {
        'light': '#E4E4E7',
        'base': '#D4D4D8',
        'strong': '#A1A1AA',
      },
      
      // ─────────────────────────────────────────────
      // Spacing System (4px base)
      // ─────────────────────────────────────────────
      spacing: {
        '4.5': '18px',
        '18': '72px',
        '22': '88px',
      },
      
      // ─────────────────────────────────────────────
      // Radius System - 现代感关键
      // ─────────────────────────────────────────────
      borderRadius: {
        'sm': '6px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
      },
      
      // ─────────────────────────────────────────────
      // Shadow System - 海外现代感
      // 不要淘宝式重阴影
      // ─────────────────────────────────────────────
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'md': '0 4px 10px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 25px rgba(0, 0, 0, 0.08)',
        'xl': '0 20px 40px rgba(0, 0, 0, 0.1)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
      
      // ─────────────────────────────────────────────
      // Animation - 轻动画
      // ─────────────────────────────────────────────
      transitionDuration: {
        'fast': '100ms',
        'normal': '150ms',
        'slow': '200ms',
      },
      
      // ─────────────────────────────────────────────
      // Max Width
      // ─────────────────────────────────────────────
      maxWidth: {
        'content': '720px',
        'wide': '1200px',
        'full-content': '1024px',
      },
    },
  },
  plugins: [],
};