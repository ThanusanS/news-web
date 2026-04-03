#!/usr/bin/env node
/**
 * Seed script — populates Appwrite with demo articles
 * Usage: node scripts/seed.js
 * Requires: NEXT_PUBLIC_APPWRITE_* env vars in .env.local
 */

require('dotenv').config({ path: '.env.local' });
const { Client, Databases, ID } = require('appwrite');

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

const db = new Databases(client);
const DB_ID  = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID  || 'ceylonupdates_db';
const COL_ID = process.env.NEXT_PUBLIC_APPWRITE_ARTICLES_COLLECTION_ID || 'articles';

const SEED_ARTICLES = [
  {
    title: "Sri Lanka's Digital Economy Reaches Record $8.5B — Government Targets $25B by 2030",
    slug: 'sri-lanka-digital-economy-8-5-billion-2026',
    category: 'sri-lanka',
    author: 'Nimal Perera',
    excerpt: 'Strong performance in tourism, exports and digital services drives Sri Lanka\'s digital transformation.',
    content: `<h2>A Landmark Milestone</h2><p>Sri Lanka's digital economy has crossed a landmark $8.5 billion valuation in 2026, according to a new report released by the Ministry of Technology and Digital Infrastructure. The figure represents a 34% year-on-year growth, driven by rapid expansion in IT services, fintech, and e-commerce sectors.</p><h2>Key Growth Drivers</h2><p>The report identified three primary growth vectors: IT-BPO exports crossing $2.1B for the first time, a booming domestic fintech sector with over 4.5 million active users, and the Port City Colombo's emergence as a regional startup hub attracting $450M in FDI over 18 months.</p><blockquote>The convergence of affordable 5G infrastructure, a young English-speaking workforce, and government incentives has created a perfect storm of opportunity — Minister Chamara Dissanayake</blockquote><h2>What This Means for Jobs</h2><p>The tech boom is translating into tangible employment opportunities. The ICT Agency of Sri Lanka estimates that the sector will require 80,000 additional skilled professionals by 2027, creating significant demand for software engineers, data scientists, cybersecurity experts, and digital marketers.</p>`,
    metaTitle: "Sri Lanka Digital Economy Hits $8.5B Record in 2026",
    metaDescription: "Sri Lanka's digital economy reaches record $8.5B valuation in 2026, with government targeting $25B by 2030 through IT, fintech and e-commerce growth.",
    focusKeyword: 'Sri Lanka digital economy 2026',
    tags: ['SriLanka', 'DigitalEconomy', 'Tech2026', 'Colombo', 'PortCity'],
    views: 24830,
    status: 'published',
    isFeatured: true,
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    title: 'How to Use ChatGPT for Content Creation — Complete 2026 Guide',
    slug: 'how-to-use-chatgpt-content-creation-2026',
    category: 'ai-tutorials',
    author: 'Kasun Silva',
    excerpt: 'Master ChatGPT with proven prompting techniques for writing, coding, research and business tasks.',
    content: `<h2>Why ChatGPT Is Essential in 2026</h2><p>ChatGPT has evolved dramatically since its launch. In 2026, it is no longer just a novelty — it is a core productivity tool used by millions of professionals worldwide. If you are not using AI to assist your work, you are leaving significant efficiency gains on the table.</p><h2>The 5 Most Powerful Prompt Techniques</h2><p>After testing hundreds of prompts, these five techniques consistently produce the best results:</p><p><strong>1. Role Assignment:</strong> Start every prompt by assigning ChatGPT a specific role. "You are an expert SEO copywriter specialising in tech content for South Asian audiences."</p><p><strong>2. Chain of Thought:</strong> Ask the model to think step-by-step before giving a final answer. This dramatically improves accuracy for complex tasks.</p><p><strong>3. Few-Shot Examples:</strong> Provide 2–3 examples of the output you want before asking for the real thing.</p><p><strong>4. Constraints:</strong> Be specific about length, format, tone and audience. Vague prompts produce vague results.</p><p><strong>5. Iterative Refinement:</strong> Never accept the first output. Always ask for improvements: "Make this more concise" or "Add more specific examples."</p><h2>Real-World Use Cases for Sri Lankan Professionals</h2><p>From drafting client emails in Sinhala and English to generating Python code snippets, ChatGPT can save Sri Lankan professionals 2–3 hours per day when used correctly.</p>`,
    metaTitle: 'How to Use ChatGPT in 2026 — Complete Guide',
    metaDescription: 'Master ChatGPT with 20 proven prompting techniques for writing, coding, research and business. Complete guide for 2026.',
    focusKeyword: 'how to use ChatGPT 2026',
    tags: ['ChatGPT', 'AI2026', 'PromptEngineering', 'AITools', 'Productivity'],
    views: 18400,
    status: 'published',
    isFeatured: true,
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    title: 'React 19 Complete Guide: Server Components, Actions & New Hooks',
    slug: 'react-19-complete-guide-server-components-2026',
    category: 'programming',
    author: 'Janaka Fernando',
    excerpt: 'Everything changed in React 19. Here is your complete guide with real project examples and migration tips.',
    content: `<h2>What Changed in React 19</h2><p>React 19 is the biggest release since React Hooks. It introduces a new compilation model, native support for async components, and a dramatically simplified data-fetching story. If you are still writing React 18 code, this guide will bring you up to speed.</p><h2>Server Components: The New Default</h2><p>Server Components allow React to render components on the server by default, sending only the minimal JavaScript to the browser. This results in faster initial page loads and smaller bundle sizes — critical for users on slower connections common in South Asia.</p><pre>// app/page.jsx — Server Component by default
async function ArticlePage({ params }) {
  const article = await fetchArticle(params.slug); // Direct DB call — no API needed
  return &lt;ArticleView article={article} /&gt;;
}</pre><h2>The New use() Hook</h2><p>The <code>use()</code> hook is the most exciting addition to React 19. It allows you to read the value of a Promise or Context directly inside a component, eliminating the need for useEffect in many cases.</p><h2>Actions: Simplified Form Handling</h2><p>React Actions replace the complex useState + fetch pattern for form submissions. Combined with useOptimistic, they enable instant UI updates while server mutations are in flight.</p>`,
    metaTitle: 'React 19 Complete Guide — Server Components & Actions',
    metaDescription: 'Master React 19 with our complete guide covering Server Components, Actions, the new use() hook, and migration tips from React 18.',
    focusKeyword: 'React 19 guide 2026',
    tags: ['React19', 'ReactJS', 'WebDev', 'JavaScript', 'Programming'],
    views: 12400,
    status: 'published',
    publishedAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    title: 'Apple WWDC 2026: M5 Chip, iOS 20 & AI-Native Siri Unveiled',
    slug: 'apple-wwdc-2026-m5-chip-ios-20-ai-siri',
    category: 'tech-news',
    author: 'Ravi De Silva',
    excerpt: "Apple's biggest developer conference brought major AI upgrades across all platforms, signalling a new era.",
    content: `<h2>The Biggest WWDC in a Decade</h2><p>Apple's 2026 Worldwide Developers Conference delivered the most significant platform changes since the introduction of Swift. At the heart of it all: the M5 chip, an AI-native version of iOS, and a completely reimagined Siri powered by on-device language models.</p><h2>M5 Chip: 40% Faster Neural Engine</h2><p>The M5 chip features a 40% faster Neural Engine than its predecessor, enabling real-time AI processing entirely on-device. This means Siri can now understand complex, multi-step requests without any server round-trip — a major privacy win for users.</p><h2>iOS 20: AI Everywhere</h2><p>iOS 20 integrates AI throughout the operating system. Mail now drafts replies in your writing style. Photos can automatically create highlight reels from your camera roll with zero effort. And the new Writing Tools feature works across every app on your device.</p><h2>Price & Availability</h2><p>The new M5 MacBook Pro starts at $1,999, with availability in Sri Lanka expected through authorised resellers within six weeks of the US launch.</p>`,
    metaTitle: 'Apple WWDC 2026: M5, iOS 20 & New AI Siri — Full Recap',
    metaDescription: 'Apple WWDC 2026 unveiled the M5 chip, iOS 20 with AI features everywhere, and a new Claude-powered Siri. Full recap of every announcement.',
    focusKeyword: 'Apple WWDC 2026',
    tags: ['Apple', 'WWDC2026', 'M5Chip', 'iOS20', 'TechNews'],
    views: 9800,
    status: 'published',
    publishedAt: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    title: 'Python for Beginners 2026: From Zero to Job-Ready in 90 Days',
    slug: 'python-beginners-guide-zero-to-job-ready-2026',
    category: 'programming',
    author: 'Buddhika Jayasena',
    excerpt: 'A structured learning path for Sri Lankan students and professionals pivoting into tech careers.',
    content: `<h2>Why Python in 2026?</h2><p>Python remains the #1 language for beginners and professionals alike. In 2026, it dominates four of the fastest-growing fields: AI/ML, data science, web automation, and backend development. Learning Python is the single highest-ROI skill investment you can make as a Sri Lankan entering the tech industry.</p><h2>The 90-Day Roadmap</h2><p><strong>Days 1–30: Foundations</strong><br/>Start with the basics: variables, data types, loops, functions and basic OOP. Use Python.org's official tutorial combined with 30 minutes of daily practice on LeetCode easy problems.</p><p><strong>Days 31–60: Libraries & Projects</strong><br/>Learn NumPy, Pandas and Matplotlib by building a real data analysis project using Sri Lanka's publicly available datasets from statistics.gov.lk.</p><p><strong>Days 61–90: Specialise</strong><br/>Choose your track: web development (Django/Flask), data science (scikit-learn), or automation (Selenium/Playwright). Build one substantial project in your chosen area.</p><h2>Free Resources for Sri Lankan Learners</h2><p>CS50P from Harvard (free on edX), Python.org's official tutorial, and the r/learnpython community are your three best starting points.</p>`,
    metaTitle: 'Python Beginner Guide 2026 — Zero to Job-Ready in 90 Days',
    metaDescription: 'Complete Python learning roadmap for 2026. Go from zero to job-ready in 90 days with this structured guide built for Sri Lankan learners.',
    focusKeyword: 'Python beginners 2026',
    tags: ['Python', 'Programming', 'Beginners', 'DataScience', 'Coding'],
    views: 14600,
    status: 'published',
    publishedAt: new Date(Date.now() - 432000000).toISOString(),
  },
];

async function seed() {
  console.log('[Seed] Starting seed...\n');
  let created = 0;
  let skipped = 0;

  for (const article of SEED_ARTICLES) {
    try {
      await db.createDocument(DB_ID, COL_ID, ID.unique(), {
        ...article,
        updatedAt: new Date().toISOString(),
        allowComments: true,
        language: 'en',
      });
      console.log(`  [OK] Created: ${article.title.slice(0, 60)}...`);
      created++;
    } catch (err) {
      if (err.code === 409) {
        console.log(`  [SKIP] Exists: ${article.slug}`);
        skipped++;
      } else {
        console.error(`  [ERROR] Failed: ${article.title}\n     ${err.message}`);
      }
    }
  }

  console.log(`\n[Done] Seed complete - ${created} created, ${skipped} skipped.`);
  console.log('   Open http://localhost:3000 to see your articles!\n');
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
