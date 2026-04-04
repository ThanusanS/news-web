import { render, screen } from '@testing-library/react';
import { truncate, stripHtml, readingTime, toSlug, formatNumber, isValidEmail, generateExcerpt, cn } from '../src/utils/helpers';
import { articleSchema, newsletterSchema, commentSchema } from '../src/utils/validators';

// ── helpers ──────────────────────────────────────────────────────────────────
describe('helpers', () => {
  describe('truncate', () => {
    it('returns string unchanged if shorter than limit', () => {
      expect(truncate('Hello world', 50)).toBe('Hello world');
    });
    it('truncates and appends ellipsis', () => {
      const result = truncate('Hello world', 5);
      expect(result).toBe('Hello...');
    });
    it('handles empty string', () => {
      expect(truncate('', 50)).toBe('');
    });
  });

  describe('stripHtml', () => {
    it('removes HTML tags', () => {
      expect(stripHtml('<p>Hello <strong>world</strong></p>')).toBe('Hello world');
    });
    it('handles empty string', () => {
      expect(stripHtml('')).toBe('');
    });
  });

  describe('readingTime', () => {
    it('estimates reading time correctly', () => {
      const content = 'word '.repeat(400); // 400 words
      const { minutes } = readingTime(content);
      expect(minutes).toBe(2);
    });
    it('returns 1 min for short content', () => {
      const { minutes } = readingTime('short content');
      expect(minutes).toBe(1);
    });
  });

  describe('toSlug', () => {
    it('converts to slug', () => {
      expect(toSlug('Hello World!')).toBe('hello-world');
    });
    it('handles special characters', () => {
      expect(toSlug('Sri Lanka: AI News 2026')).toBe('sri-lanka-ai-news-2026');
    });
  });

  describe('formatNumber', () => {
    it('formats thousands', () => {
      expect(formatNumber(1500)).toBe('1.5K');
    });
    it('formats millions', () => {
      expect(formatNumber(1500000)).toBe('1.5M');
    });
    it('handles zero', () => {
      expect(formatNumber(0)).toBe('0');
    });
  });

  describe('isValidEmail', () => {
    it('validates correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });
    it('rejects invalid email', () => {
      expect(isValidEmail('not-an-email')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('cn', () => {
    it('merges class names', () => {
      expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
    });
    it('handles conditional classes', () => {
      expect(cn('base', false && 'false-class', true && 'true-class')).toBe('base true-class');
    });
  });
});

// ── validators ────────────────────────────────────────────────────────────────
describe('validators', () => {
  describe('newsletterSchema', () => {
    it('passes valid email', () => {
      const result = newsletterSchema.safeParse({ email: 'test@example.com' });
      expect(result.success).toBe(true);
    });
    it('fails invalid email', () => {
      const result = newsletterSchema.safeParse({ email: 'bad-email' });
      expect(result.success).toBe(false);
    });
  });

  describe('articleSchema', () => {
    const validArticle = {
      title: 'This is a valid article title',
      slug: 'valid-article-slug',
      category: 'sri-lanka',
      author: 'Test Author',
      content: 'This is the content of the article and it needs to be at least one hundred characters long to pass validation.',
      status: 'draft',
    };
    it('passes valid article', () => {
      const result = articleSchema.safeParse(validArticle);
      expect(result.success).toBe(true);
    });
    it('fails short title', () => {
      const result = articleSchema.safeParse({ ...validArticle, title: 'Short' });
      expect(result.success).toBe(false);
    });
    it('fails invalid category', () => {
      const result = articleSchema.safeParse({ ...validArticle, category: 'invalid-cat' });
      expect(result.success).toBe(false);
    });
    it('fails invalid slug with spaces', () => {
      const result = articleSchema.safeParse({ ...validArticle, slug: 'slug with spaces' });
      expect(result.success).toBe(false);
    });
  });

  describe('commentSchema', () => {
    it('passes valid comment', () => {
      const result = commentSchema.safeParse({ articleId: 'abc123', name: 'John', email: 'j@test.com', content: 'Great article!' });
      expect(result.success).toBe(true);
    });
    it('fails short content', () => {
      const result = commentSchema.safeParse({ articleId: 'abc123', name: 'John', email: 'j@test.com', content: 'H' });
      expect(result.success).toBe(false);
    });
  });
});
