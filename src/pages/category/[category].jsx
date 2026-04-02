import { useState } from 'react';
import { NextSeo } from 'next-seo';
import Layout from '../../components/Layout';
import ArticleCard from '../../components/ArticleCard';
import Sidebar from '../../components/Sidebar';
import AdSense from '../../components/AdSense';
import { getArticles, getTrendingArticles } from '../../lib/appwrite';

const CATEGORY_META = {
  'sri-lanka':    { title: '🇱🇰 Sri Lanka News',    description: 'Latest Sri Lanka news covering politics, economy, sports and culture. Updated 5× daily.', emoji: '🇱🇰' },
  'tech-news':    { title: '💻 Tech News',           description: 'Global technology updates — AI, gadgets, startups and the digital world. Curated for South Asian readers.', emoji: '💻' },
  'ai-tutorials': { title: '🤖 AI Tutorials',        description: 'Learn ChatGPT, Claude, Gemini and the best AI tools. Practical guides for all skill levels.', emoji: '🤖' },
  'programming':  { title: '🐍 Programming Guides',  description: 'In-depth tutorials on MERN, Python, React, Node.js and more. Built for developers across South Asia.', emoji: '🐍' },
  'world':        { title: '🌍 World News',           description: 'International news and global affairs that matter to Sri Lankan readers.', emoji: '🌍' },
  'business':     { title: '💰 Business',             description: 'Business news, market updates and entrepreneurship advice for Sri Lankan professionals.', emoji: '💰' },
};

const PAGE_SIZE = 9;

export default function CategoryPage({ articles, trendingArticles, category, total }) {
  const [page, setPage] = useState(1);
  const meta = CATEGORY_META[category] || { title: category, description: '', emoji: '📰' };
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <NextSeo
        title={`${meta.title} | CeylonUpdates.com`}
        description={meta.description}
        canonical={`https://ceylonupdates.com/category/${category}`}
      />

      <Layout>
        {/* Category header */}
        <div className="border-b border-stone-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="font-head text-4xl font-black mb-2 text-stone-900 dark:text-neutral-50">{meta.title}</h1>
            <p className="text-stone-500 dark:text-neutral-500 text-sm max-w-xl">{meta.description}</p>
            <div className="flex items-center gap-4 mt-4 text-xs text-stone-400 dark:text-neutral-600">
              <span>{total} articles</span>
              <span>·</span>
              <span>Updated daily</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            <div>
              <AdSense type="leaderboard" className="mb-6 flex justify-center" />

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                {articles.map((a) => (
                  <ArticleCard key={a.$id} article={a} />
                ))}
              </div>

              {articles.length === 0 && (
                <div className="text-center py-20 text-stone-400 dark:text-neutral-600">
                  <div className="text-5xl mb-4">{meta.emoji}</div>
                  <p>No articles yet in this category. Check back soon!</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-9 h-9 rounded text-sm font-bold ${page === i + 1 ? 'bg-accent text-white' : 'btn-secondary'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
            <Sidebar trendingArticles={trendingArticles} />
          </div>
        </div>
      </Layout>
    </>
  );
}

export async function getStaticPaths() {
  return {
    paths: Object.keys(CATEGORY_META).map((cat) => ({ params: { category: cat } })),
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const { category } = params;
  try {
    const [res, trendingRes] = await Promise.all([
      getArticles({ category, limit: PAGE_SIZE }),
      getTrendingArticles(5),
    ]);
    return {
      props: {
        articles: res.documents,
        trendingArticles: trendingRes.documents,
        category,
        total: res.total,
      },
      revalidate: 300,
    };
  } catch {
    return {
      props: { articles: [], trendingArticles: [], category, total: 0 },
      revalidate: 60,
    };
  }
}
