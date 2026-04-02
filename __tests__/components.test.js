import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArticleCard from '../src/components/ArticleCard';
import Newsletter from '../src/components/Newsletter';

const mockArticle = {
  $id: 'test-123',
  title: 'Test Article About Sri Lanka Tech',
  slug: 'test-article',
  category: 'sri-lanka',
  author: 'Nimal Perera',
  excerpt: 'This is a test article excerpt.',
  content: 'Full article content here. '.repeat(80),
  publishedAt: new Date().toISOString(),
  views: 1234,
  featuredImage: null,
};

describe('ArticleCard', () => {
  it('renders article title', () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText(mockArticle.title)).toBeInTheDocument();
  });

  it('renders author name', () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText(mockArticle.author)).toBeInTheDocument();
  });

  it('renders category badge', () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText(/sri lanka/i)).toBeInTheDocument();
  });

  it('renders excerpt', () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText(mockArticle.excerpt)).toBeInTheDocument();
  });

  it('has correct href link', () => {
    render(<ArticleCard article={mockArticle} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/${mockArticle.slug}`);
  });

  it('renders horizontal variant', () => {
    render(<ArticleCard article={mockArticle} variant="horizontal" />);
    expect(screen.getByText(mockArticle.title)).toBeInTheDocument();
  });

  it('shows view count when views > 0', () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText(/1\.2K/i)).toBeInTheDocument();
  });
});

describe('Newsletter', () => {
  it('renders email input', () => {
    render(<Newsletter />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  });

  it('renders subscribe button', () => {
    render(<Newsletter />);
    expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument();
  });

  it('renders compact variant', () => {
    render(<Newsletter compact />);
    expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument();
  });
});
