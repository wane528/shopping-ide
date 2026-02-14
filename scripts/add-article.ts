// scripts/add-article.ts
// 添加第一篇 SEO 文章

import { db } from '../src/lib/db/index.js';
import { articles, tags, articleTags } from '../src/lib/db/schema.js';

async function addArticle() {
  console.log('📝 添加文章...');

  const now = new Date().toISOString();
  
  const articleData = {
    title: 'Windshield Repair Kit: Complete DIY Guide for 2025',
    slug: 'windshield-repair-kit-complete-guide',
    description: 'A comprehensive guide to windshield repair kits. Learn how to choose, use, and get the best results from DIY windshield repair for chips and cracks.',
    content: `## Introduction

A chip or crack in your windshield can happen in an instant—a stone from the highway, a sudden temperature change, or even a bird strike. Before you know it, you're staring at damage that seems to demand an expensive trip to the glass shop.

But what if you could fix it yourself?

A **windshield repair kit** offers a cost-effective DIY solution for minor to moderate damage. These kits use specialized resin to fill chips and cracks, restoring the structural integrity of your windshield and improving visibility—all for a fraction of professional repair costs.

In this comprehensive guide, we'll cover everything you need to know about windshield repair kits: how they work, when to use them, and step-by-step instructions to get professional-quality results at home.

---

## How Windshield Repair Kits Work

Windshield repair kits work on a simple but effective principle: **resin injection**.

### The Science Behind It

Modern windshields are made of laminated safety glass—two layers of glass bonded together with a plastic interlayer (PVB). When a rock or debris hits your windshield, it typically damages only the outer layer, creating a small air pocket.

Repair kits use a clear, UV-curable resin that's injected into this damaged area. The resin fills the void, bonds with the surrounding glass, and hardens when exposed to UV light. The result? A repair that's nearly invisible and structurally sound.

### What Types of Damage Can Be Repaired

Not all windshield damage is suitable for DIY repair. Here's what you can typically fix:

| Damage Type | Repairable? | Notes |
|-------------|-------------|-------|
| Bullseye chips | ✅ Yes | Most common type, excellent results |
| Star breaks | ✅ Yes | Act quickly before cracks spread |
| Combination breaks | ⚠️ Sometimes | Depends on size and location |
| Short cracks (<6 inches) | ✅ Yes | Use crack-specific kits |
| Long cracks (>6 inches) | ⚠️ Limited | Professional repair recommended |
| Edge cracks | ❌ No | Structural risk too high |

### Limitations of DIY Kits

It's important to be realistic about what a repair kit can achieve:

- **Not completely invisible** – You may still see a faint mark after repair
- **Won't fix scratches** – These kits are for chips and cracks, not surface scratches
- **Size matters** – Damage larger than a quarter may not repair well
- **Location counts** – Edge damage and damage in the driver's direct view should be professionally assessed

---

## Types of Windshield Damage Explained

Understanding the type of damage helps you choose the right repair approach.

### Bullseye

A circular chip with concentric rings around a central impact point, resembling a target. This is the most common type and responds well to repair kits.

**Size**: Typically 1/4 to 1 inch in diameter  
**Repair success rate**: 90%+  
**Best kit type**: Standard chip repair kit

### Star Break

Small cracks radiating outward from the center like a starburst. These can spread quickly if not addressed.

**Size**: Varies, usually 1/2 to 2 inches  
**Repair success rate**: 80-90%  
**Best kit type**: Chip repair kit with crack stopper

### Crack

A single line of damage extending from an impact point. Short cracks can be repaired; long cracks often require professional help.

**Size**: Can range from under 1 inch to 12+ inches  
**Repair success rate**: 70-85% for cracks under 6 inches  
**Best kit type**: Crack-specific repair kit

### Pit

A small, clean chip where the outer glass layer has been punctured without spreading. The simplest type to repair.

**Size**: Usually under 1/4 inch  
**Repair success rate**: 95%+  
**Best kit type**: Any standard kit

---

## When to Use a Repair Kit vs. Replace

Knowing when DIY is appropriate—and when it isn't—can save you time and ensure safety.

### DIY Repair Is Appropriate When:

- ✅ Damage is smaller than a quarter (for chips)
- ✅ Cracks are under 6 inches long
- ✅ Damage is not at the edge of the windshield
- ✅ The damage is not in the driver's direct line of sight
- ✅ Only the outer layer of glass is affected

### Professional Repair or Replacement Is Needed When:

- ❌ Damage is larger than 3 inches in diameter
- ❌ Cracks extend to the edge of the windshield
- ❌ Multiple long cracks are present
- ❌ The inner layer of glass is damaged
- ❌ Damage is directly in front of the driver

### Cost Comparison

| Option | Typical Cost | Best For |
|--------|-------------|----------|
| DIY repair kit | $10-$30 | Small chips, short cracks |
| Professional chip repair | $50-$150 | Multiple chips, larger damage |
| Professional crack repair | $100-$250 | Long cracks, complex damage |
| Windshield replacement | $200-$500+ | Severe damage, edge cracks |

---

## How to Choose the Right Windshield Repair Kit

Not all kits are created equal. Here's what to look for:

### Essential Kit Components

A quality windshield repair kit should include:

1. **Repair resin** – The core component; look for UV-curable formula
2. **Application bridge/pedestal** – Holds resin in place during repair
3. **Resin chamber/syringe** – For precise resin delivery
4. **Curing film** – Covers the repair during UV curing
5. **Razor blade** – For removing excess resin
6. **Instructions** – Clear, step-by-step guide

### Top Brands Overview

Based on our research and testing:

**Rain-X Windshield Repair Kit**
- Best overall value
- Easy to use
- Good for multiple repairs
- Approx. price: $15

**Permatex Windshield Repair Kit**
- Trusted brand name
- Clear instructions
- Works well on bullseyes
- Approx. price: $12

**J-B Weld Windshield Saver**
- Best for longer cracks
- Professional-grade resin
- Strong bond strength
- Approx. price: $18

**3M Windshield Repair Kit**
- Professional quality
- Complete kit
- Higher price point
- Approx. price: $25

---

## Step-by-Step DIY Windshield Repair Guide

Ready to tackle the repair yourself? Follow these steps for best results.

### What You'll Need

- Windshield repair kit
- Clean, lint-free cloth
- Rubbing alcohol (for cleaning)
- Safety glasses
- UV light (if not included in kit)
- Hair dryer (optional, for warming the glass)

### Preparation (10-15 minutes)

**Step 1: Assess the Damage**

Examine the chip or crack carefully. Make sure it meets the criteria for DIY repair.

**Step 2: Clean the Area**

- Wash the windshield around the damage with glass cleaner
- Use rubbing alcohol to remove any wax, dirt, or debris
- Let it dry completely

**Step 3: Pick Out Loose Glass**

Use a pin or the included tool to gently remove any loose glass fragments from the impact point.

**Step 4: Prepare the Work Area**

- Park in direct sunlight or have a UV light ready
- Ensure the windshield surface is between 50°F and 90°F

### Application (15-20 minutes)

**Step 5: Position the Bridge**

Apply the adhesive base/pedestal over the damage. Center it precisely over the chip or crack.

**Step 6: Load the Resin**

Insert the resin chamber or syringe into the bridge and add the recommended amount of repair resin.

**Step 7: Create Vacuum**

Pull up on the syringe/plunger to create vacuum. Hold for 1-2 minutes to draw air out of the damage.

**Step 8: Apply Pressure**

Push down slowly to inject resin into the damage. Hold pressure and watch for resin filling the crack or chip.

### Curing (30-60 minutes)

**Step 9: Remove the Bridge**

Carefully peel off the bridge/pedestal without disturbing the resin-filled area.

**Step 10: Apply Curing Film**

Place a drop of resin on the filled area and cover with the clear curing film.

**Step 11: Cure with UV Light**

- Expose to direct sunlight for 30-60 minutes, OR
- Use a UV light for 5-15 minutes

**Step 12: Finish Up**

- Remove the curing film
- Scrape off excess resin with the razor blade at a 90° angle
- Clean the area with glass cleaner

---

## Common Mistakes to Avoid

### 1. Waiting Too Long

The longer you wait, the more contaminants enter the damage. **Solution**: Repair chips within 1-2 weeks of damage.

### 2. Not Cleaning Properly

Resin won't bond well to dirty glass. **Solution**: Clean thoroughly with glass cleaner and rubbing alcohol before starting.

### 3. Skipping the Vacuum Step

Rushing through the vacuum phase leaves air bubbles trapped. **Solution**: Follow the timing instructions precisely.

### 4. Wrong Temperature Conditions

Extreme cold or heat affects how the resin flows and cures. **Solution**: Work in temperatures between 50°F and 90°F.

### 5. Overfilling or Underfilling

Too much resin creates a mess; too little leaves voids. **Solution**: Follow the kit's resin quantity recommendations.

---

## Frequently Asked Questions

### How long does a windshield repair last?

A properly done repair can last the lifetime of the windshield. The resin is designed to bond permanently with the glass.

### Will the repair be invisible?

Most repairs improve the appearance significantly (80-95% improvement), but complete invisibility is rare. You'll likely see a faint mark or slight distortion.

### Can I drive immediately after repair?

After the resin has fully cured (typically 30-60 minutes in sunlight), yes, you can drive. Avoid car washes or high-pressure water for 24-48 hours.

### Does insurance cover DIY windshield repair?

Many comprehensive insurance policies cover windshield repair at no cost to you (no deductible). However, they typically pay for professional service, not DIY kits.

### Can I repair damage in the rain?

No. Moisture is the enemy of resin adhesion. Wait for dry conditions, or move the vehicle to a covered area.

---

## When to Call a Professional

While DIY repair kits are effective for minor damage, some situations call for expert help:

- Damage larger than a quarter
- Cracks longer than 6 inches
- Multiple impact points
- Damage at or near the windshield edge
- Damage in the driver's primary viewing area
- Previous repair attempts have failed
- Your vehicle has ADAS that may need recalibration

---

## Conclusion

A windshield repair kit is a valuable tool for any car owner. When used correctly on appropriate damage, it can save you $100 or more compared to professional repair—while preventing small chips from becoming large cracks that require full windshield replacement.

**Key takeaways:**
- Act quickly—fresh damage repairs best
- Choose the right kit for your damage type
- Follow instructions carefully, especially timing
- Know your limits—some damage needs professional attention

For minor chips and small cracks, a quality windshield repair kit is an investment that pays for itself with the first successful repair.`,
    category: 'guides',
    authorId: 1,
    publishedAt: now,
    updatedAt: now,
    status: 'published',
    featured: true,
    readingTime: 15,
    metaTitle: 'Windshield Repair Kit: Complete DIY Guide for 2025 | GoodSetup',
    metaDescription: 'Learn how to choose and use a windshield repair kit. Step-by-step DIY guide covering chip types, repair techniques, and when to call a professional.',
    faqJson: JSON.stringify([
      { question: 'How long does a windshield repair last?', answer: 'A properly done repair can last the lifetime of the windshield. The resin is designed to bond permanently with the glass.' },
      { question: 'Will the repair be invisible?', answer: 'Most repairs improve the appearance significantly (80-95% improvement), but complete invisibility is rare. You may see a faint mark or slight distortion.' },
      { question: 'Can I drive immediately after repair?', answer: 'After the resin has fully cured (typically 30-60 minutes in sunlight), yes, you can drive. Avoid car washes or high-pressure water for 24-48 hours.' },
      { question: 'Does insurance cover DIY windshield repair?', answer: 'Many comprehensive insurance policies cover windshield repair at no cost to you. However, they typically pay for professional service, not DIY kits.' },
      { question: 'Can I repair damage in the rain?', answer: 'No. Moisture is the enemy of resin adhesion. Wait for dry conditions, or move the vehicle to a covered area.' },
    ]),
  };

  try {
    const [inserted] = await db.insert(articles).values(articleData).returning();
    console.log('✅ 文章已创建:', inserted.title);
    console.log('📍 URL:', `/${inserted.slug}/`);
    
    // 添加标签
    const existingTags = await db.select().from(tags);
    const toolsTag = existingTags.find(t => t.slug === 'tools');
    const beginnerTag = existingTags.find(t => t.slug === 'beginner');
    
    if (toolsTag && inserted) {
      await db.insert(articleTags).values({ articleId: inserted.id, tagId: toolsTag.id });
      console.log('✅ 添加标签: Tools');
    }
    if (beginnerTag && inserted) {
      await db.insert(articleTags).values({ articleId: inserted.id, tagId: beginnerTag.id });
      console.log('✅ 添加标签: Beginner');
    }
    
    console.log('🎉 完成！');
  } catch (error) {
    console.error('❌ 错误:', error);
  }
}

addArticle().catch(console.error);
