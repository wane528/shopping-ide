#!/usr/bin/env python3
"""
生成文章导入 JSON 文件
"""
import json
from datetime import datetime, timedelta

# 计算发布时间（每2天发布一篇）
base_date = datetime(2026, 2, 17, 10, 0, 0)  # 2026-02-17 10:00:00

articles = [
    {
        "title": "The Complete Guide to Windshield Repair Kits: Fix Chips & Cracks Like a Pro (2026)",
        "slug": "windshield-repair-kit-guide",
        "description": "Learn everything about windshield repair kits in 2026. Compare top products, step-by-step tutorials, and expert tips to fix chips and cracks yourself. Save $100+ on repairs!",
        "category": "guides",
        "status": "scheduled",
        "featured": True,
        "metaTitle": "Windshield Repair Kit Guide 2026: Fix Chips & Cracks (Save $100+)",
        "metaDescription": "Complete guide to windshield repair kits. Compare top 10 products, learn DIY repair steps, and save $100+ on professional repairs. Expert tips included.",
        "authorName": "GoodSetup Team",
        "tags": ["windshield repair", "auto maintenance", "DIY", "car care"],
        "readingTime": 18,
        "scheduledAt": (base_date).isoformat(),
    },
    {
        "title": "Permatex Windshield Repair Kit Review: Is It Worth It? (2026 Update)",
        "slug": "permatex-windshield-repair-kit-review",
        "description": "In-depth Permatex windshield repair kit review. Real-world testing, pros & cons, step-by-step usage guide, and comparison with competitors. Updated for 2026.",
        "category": "reviews",
        "status": "scheduled",
        "featured": True,
        "metaTitle": "Permatex Windshield Repair Kit Review 2026: Tested & Rated",
        "metaDescription": "Honest Permatex windshield repair kit review based on real testing. Learn pros, cons, usage tips, and whether it's the best choice for your needs.",
        "authorName": "GoodSetup Team",
        "tags": ["permatex", "product review", "windshield repair", "auto parts"],
        "readingTime": 12,
        "scheduledAt": (base_date + timedelta(days=2)).isoformat(),
    },
    {
        "title": "Best Windshield Repair Kit for Long Cracks: Top 5 Picks (2026)",
        "slug": "best-windshield-repair-kit-long-cracks",
        "description": "Discover the best windshield repair kits for long cracks (6-12 inches). Expert reviews, comparison table, and tips for successful crack repairs.",
        "category": "reviews",
        "status": "scheduled",
        "featured": False,
        "metaTitle": "Best Windshield Repair Kit for Long Cracks 2026 | Top 5 Tested",
        "metaDescription": "Find the best windshield repair kit for long cracks. We tested 15+ kits to find the top 5 that actually work on 6-12 inch cracks. Expert reviews.",
        "authorName": "GoodSetup Team",
        "tags": ["windshield repair", "long cracks", "product comparison", "reviews"],
        "readingTime": 10,
        "scheduledAt": (base_date + timedelta(days=4)).isoformat(),
    },
    {
        "title": "DIY Windshield Repair: Complete Step-by-Step Guide (2026)",
        "slug": "diy-windshield-repair-guide",
        "description": "Master DIY windshield repair with our complete guide. Learn professional techniques, avoid common mistakes, and achieve 90%+ invisible repairs at home.",
        "category": "guides",
        "status": "scheduled",
        "featured": False,
        "metaTitle": "DIY Windshield Repair Guide 2026: Pro Techniques at Home",
        "metaDescription": "Complete DIY windshield repair guide with professional techniques. Step-by-step instructions, video tutorials, and expert tips for perfect results.",
        "authorName": "GoodSetup Team",
        "tags": ["DIY", "windshield repair", "tutorial", "car maintenance"],
        "readingTime": 15,
        "scheduledAt": (base_date + timedelta(days=6)).isoformat(),
    },
    {
        "title": "Rain-X Windshield Repair Kit Instructions: Complete Tutorial (2026)",
        "slug": "rain-x-windshield-repair-kit-instructions",
        "description": "Detailed Rain-X windshield repair kit instructions with photos and video. Learn the correct technique, troubleshooting tips, and how to get professional results.",
        "category": "guides",
        "status": "scheduled",
        "featured": False,
        "metaTitle": "Rain-X Windshield Repair Kit Instructions | Step-by-Step Guide",
        "metaDescription": "Complete Rain-X windshield repair kit instructions with photos. Learn the correct application technique and troubleshooting tips for perfect repairs.",
        "authorName": "GoodSetup Team",
        "tags": ["rain-x", "instructions", "windshield repair", "tutorial"],
        "readingTime": 8,
        "scheduledAt": (base_date + timedelta(days=8)).isoformat(),
    },
]

# 生成 JSON 文件
output = {
    "articles": articles,
    "metadata": {
        "generated_at": datetime.now().isoformat(),
        "total_articles": len(articles),
        "publish_schedule": "Every 2 days starting from 2026-02-17",
        "category_distribution": {
            "guides": sum(1 for a in articles if a["category"] == "guides"),
            "reviews": sum(1 for a in articles if a["category"] == "reviews"),
        }
    }
}

with open("articles-metadata.json", "w", encoding="utf-8") as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"✓ Generated {len(articles)} articles")
print(f"✓ Saved to articles-metadata.json")
print(f"\nPublish Schedule:")
for i, article in enumerate(articles, 1):
    print(f"{i}. {article['scheduledAt'][:10]} - {article['title'][:60]}...")
