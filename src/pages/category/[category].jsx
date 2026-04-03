import { useState } from 'react';
import { NextSeo } from 'next-seo';
import Layout from '../../components/Layout';
import ArticleCard from '../../components/ArticleCard';
import Sidebar from '../../components/Sidebar';
import AdSense from '../../components/AdSense';
import { getArticles, getTrendingArticles } from '../../lib/appwrite';
import { FiMonitor, FiCpu, FiCode, FiGlobe, FiBriefcase, FiFileText, FiActivity, FiBookOpen } from 'react-icons/fi';

const CATEGORY_META = {
  'sri-lanka':    { title: 'Sri Lanka News',    description: 'Latest Sri Lanka news covering politics, economy, sports and culture. Updated 5x daily.', Icon: FiGlobe },
  'tech-news':    { title: 'Tech News',           description: 'Global technology updates — AI, gadgets, startups and the digital world. Curated for South Asian readers.', Icon: FiMonitor },
  'sports':       { title: 'Sports',              description: 'Latest sports news, cricket updates, match analysis and athlete stories from Sri Lanka and beyond.', Icon: FiActivity },
  'ai-tutorials': { title: 'AI & Innovation',     description: 'Learn ChatGPT, Claude, Gemini and the best AI tools. Practical guides for all skill levels.', Icon: FiCpu },
  'jobs-careers': { title: 'Jobs & Careers',      description: 'Career advice, hiring trends, remote opportunities and practical guidance for professional growth.', Icon: FiBriefcase },
  'education':    { title: 'Education',           description: 'Education news, university updates, study resources and skill-building pathways for students.', Icon: FiBookOpen },
  'programming':  { title: 'Programming Guides',  description: 'In-depth tutorials on MERN, Python, React, Node.js and more. Built for developers across South Asia.', Icon: FiCode },
  'world':        { title: 'World News',           description: 'International news and global affairs that matter to Sri Lankan readers.', Icon: FiGlobe },
  'business':     { title: 'Business',             description: 'Business news, market updates and entrepreneurship advice for Sri Lankan professionals.', Icon: FiBriefcase },
};

const PAGE_SIZE = 9;

export default function CategoryPage({ articles, trendingArticles, category, total }) {
  const [page, setPage] = useState(1);
  const meta = CATEGORY_META[category] || { title: category, description: '', Icon: FiFileText };
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
          <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
            <h1 className="font-head text-3xl md:text-4xl font-black mb-2 text-stone-900 dark:text-neutral-50">{meta.title}</h1>
            <p className="text-stone-500 dark:text-neutral-500 text-sm max-w-xl">{meta.description}</p>
            <div className="flex items-center gap-4 mt-4 text-xs text-stone-400 dark:text-neutral-600">
              <span>{total} articles</span>
              <span>·</span>
              <span>Updated daily</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
            <div>
              <AdSense type="leaderboard" className="mb-6 flex justify-center" />

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                {articles.map((a) => (
                  <ArticleCard key={a.$id} article={a} />
                ))}
              </div>

              {articles.length === 0 && (
                <div className="text-center py-20 text-stone-400 dark:text-neutral-600">
                  <div className="mb-4 flex justify-center text-accent"><meta.Icon size={44} /></div>
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
