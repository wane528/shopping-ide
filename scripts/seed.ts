// scripts/seed.ts
// 种子数据脚本 - 初始化数据库和示例内容

import { db } from '../src/lib/db';
import { articles, authors, categories, tags, articleTags } from '../src/lib/db/schema';

async function seed() {
  console.log('🌱 开始种子数据...');

  // 1. 创建作者
  const insertedAuthors = await db.insert(authors).values([
    {
      name: 'GoodSetup Team',
      slug: 'goodsetup-team',
      bio: 'We create helpful guides and resources for better setups.',
      expertise: JSON.stringify(['Technology', 'Productivity', 'Software']),
    },
  ]).returning();
  console.log('✅ 创建作者:', insertedAuthors.length);

  // 2. 创建分类
  const insertedCategories = await db.insert(categories).values([
    { name: 'Guides', slug: 'guides', description: 'Step-by-step tutorials and comprehensive guides', color: 'blue', order: 1 },
    { name: 'Reviews', slug: 'reviews', description: 'In-depth, honest reviews of products and services', color: 'green', order: 2 },
    { name: 'Tips', slug: 'tips', description: 'Quick tips and practical advice', color: 'orange', order: 3 },
    { name: 'Resources', slug: 'resources', description: 'Curated collections of tools and resources', color: 'purple', order: 4 },
  ]).returning();
  console.log('✅ 创建分类:', insertedCategories.length);

  // 3. 创建标签
  const insertedTags = await db.insert(tags).values([
    { name: 'Beginner', slug: 'beginner' },
    { name: 'Advanced', slug: 'advanced' },
    { name: 'Free', slug: 'free' },
    { name: 'Productivity', slug: 'productivity' },
    { name: 'Tools', slug: 'tools' },
  ]).returning();
  console.log('✅ 创建标签:', insertedTags.length);

  // 4. 创建示例文章
  const now = new Date().toISOString();
  const articleData = [
    {
      title: "The Complete Beginner's Guide to Getting Started",
      slug: 'getting-started-guide',
      description: 'Everything you need to know to get started, from basics to best practices. A comprehensive guide for beginners.',
      content: `## Introduction

Welcome to the complete beginner's guide. This comprehensive resource will walk you through everything you need to know to get started effectively.

**What you'll learn:**

- Core concepts and fundamentals
- Step-by-step implementation
- Best practices to follow
- Common pitfalls to avoid

## Getting Started

Before diving in, let's understand the basics. This guide assumes no prior knowledge and will build up your understanding progressively.

### Step 1: Preparation

The first step is proper preparation. Make sure you have a clear goal in mind.

### Step 2: Foundation Building

Build your foundation step by step. Don't rush this phase—it's critical for long-term success.

### Step 3: Implementation

Now it's time to put theory into practice.

## Conclusion

You now have everything you need to get started. Good luck on your journey!`,
      category: 'guides',
      authorId: insertedAuthors[0].id,
      publishedAt: now,
      updatedAt: now,
      status: 'published',
      featured: true,
      readingTime: 12,
      faqJson: JSON.stringify([
        { question: 'How long does it take to learn?', answer: 'Most beginners can grasp the basics within a few days of consistent practice.' },
        { question: 'Do I need any prior experience?', answer: 'No prior experience is required. This guide is designed for complete beginners.' },
      ]),
    },
    {
      title: 'Top 10 Productivity Tools for 2026',
      slug: 'top-productivity-tools-2026',
      description: 'A comprehensive review of the best productivity tools available in 2026. Compare features, pricing, and use cases.',
      content: `## Introduction

Productivity tools can transform how you work. In this article, we review the top 10 productivity tools for 2026.

## The List

1. **Tool A** - Best for project management
2. **Tool B** - Best for note-taking
3. **Tool C** - Best for time tracking
4. **Tool D** - Best for collaboration
5. **Tool E** - Best for automation

## Detailed Reviews

### Tool A

A powerful project management tool with intuitive interface.

### Tool B

Excellent note-taking app with rich formatting options.

## Conclusion

Choose the tools that best fit your workflow and needs.`,
      category: 'reviews',
      authorId: insertedAuthors[0].id,
      publishedAt: now,
      updatedAt: now,
      status: 'published',
      featured: false,
      readingTime: 15,
    },
    {
      title: '5 Quick Tips to Boost Your Efficiency',
      slug: 'quick-tips-efficiency',
      description: 'Simple but effective tips to immediately improve your daily productivity and workflow.',
      content: `## Quick Tips

Here are 5 tips you can implement right now:

1. **Start your day with a plan** - Take 5 minutes each morning to outline your priorities.

2. **Use the 2-minute rule** - If a task takes less than 2 minutes, do it immediately.

3. **Batch similar tasks** - Group similar activities together for better focus.

4. **Take regular breaks** - Short breaks improve overall productivity.

5. **Review weekly** - Assess what worked and what didn't each week.

## Conclusion

Small changes can lead to big improvements. Start with one tip and build from there.`,
      category: 'tips',
      authorId: insertedAuthors[0].id,
      publishedAt: now,
      updatedAt: now,
      status: 'published',
      featured: false,
      readingTime: 5,
    },
  ];

  const insertedArticles = await db.insert(articles).values(articleData).returning();
  console.log('✅ 创建文章:', insertedArticles.length);

  // 5. 创建文章-标签关联
  if (insertedArticles.length > 0 && insertedTags.length > 0) {
    await db.insert(articleTags).values([
      { articleId: insertedArticles[0].id, tagId: insertedTags[0].id }, // Beginner
      { articleId: insertedArticles[0].id, tagId: insertedTags[3].id }, // Productivity
      { articleId: insertedArticles[1].id, tagId: insertedTags[4].id }, // Tools
      { articleId: insertedArticles[2].id, tagId: insertedTags[3].id }, // Productivity
    ]);
    console.log('✅ 创建文章-标签关联');
  }

  console.log('🎉 种子数据完成！');
}

seed().catch(console.error);
