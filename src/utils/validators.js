import { z } from 'zod';

export const articleSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(300, 'Title too long'),
  slug: z
    .string()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug: only lowercase letters, numbers, hyphens'),
  category: z.enum([
    'sri-lanka',
    'tech-news',
    'sports',
    'ai-tutorials',
    'jobs-careers',
    'education',
    'programming',
    'world',
    'business',
  ]),
  author: z.string().min(2, 'Author name required').max(100),
  content: z.string().min(100, 'Content too short — aim for at least 800 words'),
  excerpt: z.string().max(300).optional(),
  featuredImage: z.string().url().optional().or(z.literal('')),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  ogTitle: z.string().max(100).optional(),
  ogDescription: z.string().max(200).optional(),
  canonicalUrl: z.string().url().optional().or(z.literal('')),
  focusKeyword: z.string().max(100).optional(),
  tags: z.array(z.string()).max(10).optional(),
  status: z.enum(['published', 'draft', 'scheduled']).default('draft'),
  publishedAt: z.string().optional(),
  language: z.enum(['en', 'si', 'ta']).default('en'),
  isFeatured: z.boolean().optional().default(false),
  allowComments: z.boolean().optional().default(true),
});

export const commentSchema = z.object({
  articleId: z.string().min(1),
  parentId: z.string().min(1).optional().or(z.literal('')),
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Valid email required').optional().or(z.literal('')),
  content: z.string().min(2, 'Comment too short').max(1000, 'Comment too long'),
  website: z.string().url().optional().or(z.literal('')),
});

export const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(2).max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(5).max(200),
  message: z.string().min(20).max(2000),
});

export const searchSchema = z.object({
  q: z.string().min(1).max(200),
  category: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
});
