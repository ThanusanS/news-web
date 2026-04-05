# CeylonUpdates.com v2.0 — Industry-Level Setup Guide

## Quick Start

```bash
npm install
cp .env.local.example .env.local   # Fill in your Appwrite IDs
npm run dev                         # http://localhost:3000
```

## Appwrite Collections Required

Run: `node scripts/setup-appwrite.js` to print all schemas.

### articles

title(300), slug(200)[unique], content(500000), excerpt(500), category(50),
author(100), featuredImage(500), status(20), views(int), metaTitle(70),
metaDescription(160), focusKeyword(100), tags(array), publishedAt(datetime),
updatedAt(datetime), isFeatured(bool), allowComments(bool), language(5)

Indexes: slug[unique], status[key], category[key], views[key], title[fulltext], tags[fulltext]

### subscribers

email(254)[unique], name(100), subscribedAt(30), active(bool), source(200)

### comments

articleId(36)[index], name(100), email(254), content(1000), website(200), approved(bool)[index], createdAt(30)

## Admin Login

URL: /admin/login
Create user in Appwrite → Auth → Users → Create User

## Seed Demo Data

node scripts/seed.js

## Deploy Vercel

vercel --prod

Set these Environment Variables in Vercel Project Settings before deploying:

- NEXT_PUBLIC_APPWRITE_ENDPOINT
- NEXT_PUBLIC_APPWRITE_PROJECT_ID
- NEXT_PUBLIC_APPWRITE_DATABASE_ID
- NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID
- APPWRITE_ENDPOINT
- APPWRITE_PROJECT_ID
- APPWRITE_API_KEY
- APPWRITE_DATABASE_ID
- APPWRITE_COMMENTS_COLLECTION_ID
- AI_PROVIDER_ORDER (optional, default: openrouter,gemini,groq,ollama,hf,openai)
- OPENROUTER_FREE_AVAILABLE (optional, default: true)
- OPENROUTER_API_KEY (priority 1)
- OPENROUTER_FREE_MODEL (optional, default: google/gemma-2-9b-it:free)
- OPENROUTER_MODEL (optional backup model)
- GEMINI_API_KEY (optional fallback, priority 2)
- GEMINI_MODEL (optional, default: gemini-1.5-flash)
- GROQ_API_KEY (optional fallback, priority 3)
- GROQ_MODEL (optional, default: llama-3.1-8b-instant)
- OLLAMA_ENABLED (optional, default: true)
- OLLAMA_BASE_URL (optional, default: http://127.0.0.1:11434)
- OLLAMA_MODEL (optional, default: llama3.1:8b)
- HF_TOKEN
- HF_MODEL (optional, default: deepseek-ai/DeepSeek-V3-0324:novita)
- OPENAI_API_KEY (optional fallback)
- OPENAI_MODEL (optional, default: gpt-4o-mini)
- OPENROUTER_API_KEY (optional fallback)
- OPENROUTER_MODEL (optional, default: openai/gpt-4o-mini)

APPWRITE_API_KEY should have Database read/write permission for the comments collection.

## Run Tests

npm test
npm run test:coverage

## Docker

docker build -t ceylonupdates .
docker run -p 3000:3000 --env-file .env.local ceylonupdates

## API Endpoints

GET /api/articles - list (filter: category, status, search, sort)
POST /api/articles - create (auth required)
GET /api/articles/[id] - get by id or slug
PUT /api/articles/[id] - update (auth required)
DELETE /api/articles/[id] - delete (auth required)
POST /api/admin/generate-article - generate AI article draft for admin editor
POST /api/articles/[id]/view - increment view count
GET /api/comments?articleId=X - get approved comments
POST /api/comments - submit comment
POST /api/newsletter - subscribe
GET /api/rss - RSS 2.0 feed
GET /api/og?title=X - dynamic OG image
GET /api/health - health check

## Key Files

src/utils/constants.js - site config, categories, ad slots
src/utils/helpers.js - 20+ utility functions
src/utils/validators.js - Zod validation schemas
src/hooks/index.js - 10 custom SWR hooks
src/lib/appwrite.js - Appwrite client + all DB helpers
src/lib/seo.js - SEO utils + JSON-LD schema builders
