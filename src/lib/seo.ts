// src/lib/seo.ts

interface SEOConfig {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: Date;
  modifiedTime?: Date;
  author?: string;
  noindex?: boolean;
}

const SITE_NAME = 'PuraCatCare';
// 使用环境变量配置域名，开发环境默认使用 localhost
const SITE_URL = import.meta.env.SITE_URL || 'http://localhost:4321';
const DEFAULT_IMAGE = '/images/og-default.jpg';

/**
 * 生成完整的 SEO 元数据
 */
export function generateSEO(config: SEOConfig) {
  const {
    title,
    description,
    canonical,
    image = DEFAULT_IMAGE,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    noindex = false,
  } = config;

  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
  const fullImageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  return {
    // Basic
    title: fullTitle,
    description,
    canonical: canonical || `${SITE_URL}/`,
    
    // Robots
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
    
    // Open Graph
    og: {
      type,
      title: fullTitle,
      description,
      url: canonical || `${SITE_URL}/`,
      site_name: SITE_NAME,
      image: fullImageUrl,
      ...(type === 'article' && publishedTime && {
        article: {
          published_time: publishedTime.toISOString(),
          modified_time: (modifiedTime || publishedTime)?.toISOString(),
          author,
        },
      }),
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      image: fullImageUrl,
    },
  };
}

/**
 * 生成 Article Schema
 */
export function generateArticleSchema(article: {
  title: string;
  description: string;
  slug: string;
  publishedAt: Date;
  updatedAt?: Date;
  authorName?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "image": article.image ? `${SITE_URL}${article.image}` : undefined,
    "author": {
      "@type": article.authorName ? "Person" : "Organization",
      "name": article.authorName || SITE_NAME
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/favicon.svg`
      }
    },
    "datePublished": article.publishedAt.toISOString(),
    "dateModified": (article.updatedAt || article.publishedAt).toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${SITE_URL}/${article.slug}`
    }
  };
}

/**
 * 生成 BreadcrumbList Schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url?: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      ...(item.url && { "item": `${SITE_URL}${item.url}` })
    }))
  };
}

/**
 * 生成 FAQ Schema
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * 生成 HowTo Schema
 */
export function generateHowToSchema(config: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string; image?: string }>;
  totalTime?: string;
  estimatedCost?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": config.name,
    "description": config.description,
    "step": config.steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      ...(step.image && { "image": `${SITE_URL}${step.image}` })
    })),
    ...(config.totalTime && { "totalTime": config.totalTime }),
    ...(config.estimatedCost && { "estimatedCost": { "@type": "MonetaryAmount", "text": config.estimatedCost } })
  };
}

/**
 * 生成 Organization Schema
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": SITE_NAME,
    "url": SITE_URL,
    "logo": `${SITE_URL}/images/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "puracatcare@hotmail.com",
      "contactType": "customer service"
    }
  };
}

/**
 * 生成 WebSite Schema with SearchBox
 */
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE_NAME,
    "url": SITE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

/**
 * 生成 Speakable Specification（语音搜索优化）
 */
export function generateSpeakableSchema(config: {
  headlineSelector: string;
  articleBodySelector: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SpeakableSpecification",
    "cssSelector": [config.headlineSelector, config.articleBodySelector]
  };
}

/**
 * 生成 Review Schema（产品评测结构化数据）
 */
export function generateReviewSchema(config: {
  productName: string;
  reviewBody: string;
  ratingValue: number;
  bestRating?: number;
  worstRating?: number;
  authorName?: string;
  datePublished?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "Product",
      "name": config.productName,
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": config.ratingValue,
      "bestRating": config.bestRating || 5,
      "worstRating": config.worstRating || 1,
    },
    "reviewBody": config.reviewBody,
    "author": {
      "@type": config.authorName ? "Person" : "Organization",
      "name": config.authorName || SITE_NAME,
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
    },
    ...(config.datePublished && { "datePublished": config.datePublished }),
  };
}
