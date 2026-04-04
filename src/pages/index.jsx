import { NextSeo } from 'next-seo';
import Layout from '../components/Layout';
import ArticleCard from '../components/ArticleCard';
import Sidebar from '../components/Sidebar';
import AdSense from '../components/AdSense';
import Link from 'next/link';
import { FiCpu, FiFileText, FiActivity, FiBriefcase, FiBookOpen } from 'react-icons/fi';
import { getArticles, getTrendingArticles } from '../lib/appwrite';

export default function HomePage({ latestArticles, trendingArticles, heroArticle, sideArticles }) {
  const getSectionArticles = (category) => {
    const exactMatches = latestArticles.filter((article) => article.category === category);
    if (exactMatches.length >= 3) return exactMatches.slice(0, 3);

    const fallback = latestArticles.filter((article) => article.category !== category);
    return [...exactMatches, ...fallback].slice(0, 3);
  };

  return (
    <>
      <NextSeo
        title="CeylonUpdates.com — Latest Sri Lanka News, AI Tutorials & Tech"
        description="Latest Sri Lanka news, AI tutorials, tech updates and programming guides. Your #1 source for fast, reliable news and in-depth tech content. Updated 5× daily."
        canonical="https://ceylonupdates.com"
        openGraph={{
          type: 'website',
          url: 'https://ceylonupdates.com',
          title: 'CeylonUpdates.com — Latest Sri Lanka News, AI & Tech',
          description: 'Latest Sri Lanka news, AI tutorials, tech updates and programming guides.',
          images: [{ url: 'https://ceylonupdates.com/og-default.jpg', width: 1200, height: 630 }],
          site_name: 'CeylonUpdates.com',
        }}
        twitter={{ cardType: 'summary_large_image', site: '@CeylonUpdates' }}
      />

      <Layout>
        {/* ── HERO ── */}
        <section className="mx-auto max-w-7xl px-4 py-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Main hero */}
            <Link
              href={`/${heroArticle?.slug || '#'}`}
              className="group relative block min-h-[360px] cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br from-navy to-accent lg:col-span-2"
            >
              {heroArticle?.featuredImage && (
                <img
                  src={heroArticle.featuredImage}
                  alt={heroArticle.title}
                  className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                />
              )}
              <div className="hero-overlay absolute inset-0" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="mb-3 inline-block rounded bg-accent px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                  {heroArticle?.category?.replace(/-/g, ' ') || 'Sri Lanka'}
                </span>
                <h1 className="mb-2 font-head text-2xl font-black leading-snug text-white md:text-3xl">
                  {heroArticle?.title || 'Welcome to CeylonUpdates — Your Daily News & Tech Source'}
                </h1>
                <p className="text-sm text-white/70">
                  By {heroArticle?.author || 'Staff Writer'} &nbsp;·&nbsp; 5 min read
                </p>
              </div>
            </Link>

            {/* Side cards */}
            <div className="flex flex-col gap-3">
              {sideArticles.slice(0, 4).map((a) => (
                <Link
                  key={a.$id}
                  href={`/${a.slug}`}
                  className="group flex gap-3 rounded-lg border border-stone-200 bg-white p-3 transition-all hover:border-accent dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded bg-gradient-to-br from-navy to-accent text-xl">
                    {a.featuredImage ? (
                      <img
                        src={a.featuredImage}
                        alt={a.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <FiFileText size={18} />
                    )}
                  </div>
                  <div>
                    <div className="mb-1 text-[9px] font-black uppercase tracking-widest text-accent">
                      {a.category?.replace(/-/g, ' ')}
                    </div>
                    <h3 className="line-clamp-2 font-head text-sm font-bold leading-snug text-stone-900 transition-colors group-hover:text-accent dark:text-neutral-100">
                      {a.title}
                    </h3>
                    <p className="mt-1 text-[11px] text-stone-400 dark:text-neutral-600">
                      {Math.ceil((a.content?.split(' ')?.length || 400) / 200)} min read
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── LEADERBOARD AD ── */}
        <div className="mx-auto mb-6 flex max-w-7xl justify-center px-4">
          <AdSense type="leaderboard" />
        </div>

        {/* ── MAIN CONTENT + SIDEBAR ── */}
        <div className="mx-auto max-w-7xl px-4 pb-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
            <div>
              {/* Latest News */}
              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between border-b-2 border-stone-200 pb-2 dark:border-neutral-800">
                  <h2 className="section-title">Latest News</h2>
                  <Link
                    href="/category/sri-lanka"
                    className="text-xs font-bold text-accent hover:underline"
                  >
                    All News →
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {latestArticles.slice(0, 3).map((a) => (
                    <ArticleCard key={a.$id} article={a} />
                  ))}
                </div>
              </div>

              {/* In-article ad */}
              <div className="mb-8 flex justify-center">
                <AdSense type="inArticle" />
              </div>

              {/* Sri Lanka News */}
              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between border-b-2 border-stone-200 pb-2 dark:border-neutral-800">
                  <h2 className="section-title">Sri Lanka News</h2>
                  <Link
                    href="/category/sri-lanka"
                    className="text-xs font-bold text-accent hover:underline"
                  >
                    All Sri Lanka News →
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {getSectionArticles('sri-lanka').map((a) => (
                    <ArticleCard key={a.$id} article={a} />
                  ))}
                </div>
              </div>

              {/* World News */}
              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between border-b-2 border-stone-200 pb-2 dark:border-neutral-800">
                  <h2 className="section-title">World News</h2>
                  <Link
                    href="/category/world"
                    className="text-xs font-bold text-accent hover:underline"
                  >
                    All World News →
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {getSectionArticles('world').map((a) => (
                    <ArticleCard key={a.$id} article={a} />
                  ))}
                </div>
              </div>

              {/* Tech News */}
              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between border-b-2 border-stone-200 pb-2 dark:border-neutral-800">
                  <h2 className="section-title">Tech News</h2>
                  <Link
                    href="/category/tech-news"
                    className="text-xs font-bold text-accent hover:underline"
                  >
                    All Tech News →
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {getSectionArticles('tech-news').map((a) => (
                    <ArticleCard key={a.$id} article={a} />
                  ))}
                </div>
              </div>

              {/* AI & Innovation */}
              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between border-b-2 border-stone-200 pb-2 dark:border-neutral-800">
                  <h2 className="section-title">
                    <FiCpu className="mr-2 inline-block" size={16} />
                    AI & Innovation
                  </h2>
                  <Link
                    href="/category/ai-tutorials"
                    className="text-xs font-bold text-accent hover:underline"
                  >
                    All AI & Innovation →
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {latestArticles
                    .filter((a) => a.category === 'ai-tutorials')
                    .slice(0, 3)
                    .map((a) => (
                      <ArticleCard key={a.$id} article={a} />
                    ))}
                </div>
              </div>

              {/* Sports */}
              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between border-b-2 border-stone-200 pb-2 dark:border-neutral-800">
                  <h2 className="section-title">
                    <FiActivity className="mr-2 inline-block" size={16} />
                    Sports
                  </h2>
                  <Link
                    href="/category/sports"
                    className="text-xs font-bold text-accent hover:underline"
                  >
                    All Sports →
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {getSectionArticles('sports').map((a) => (
                    <ArticleCard key={a.$id} article={a} />
                  ))}
                </div>
              </div>

              {/* Jobs & Careers */}
              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between border-b-2 border-stone-200 pb-2 dark:border-neutral-800">
                  <h2 className="section-title">
                    <FiBriefcase className="mr-2 inline-block" size={16} />
                    Jobs & Careers
                  </h2>
                  <Link
                    href="/category/jobs-careers"
                    className="text-xs font-bold text-accent hover:underline"
                  >
                    All Jobs →
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {getSectionArticles('jobs-careers').map((a) => (
                    <ArticleCard key={a.$id} article={a} />
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between border-b-2 border-stone-200 pb-2 dark:border-neutral-800">
                  <h2 className="section-title">
                    <FiBookOpen className="mr-2 inline-block" size={16} />
                    Education
                  </h2>
                  <Link
                    href="/category/education"
                    className="text-xs font-bold text-accent hover:underline"
                  >
                    All Education →
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {getSectionArticles('education').map((a) => (
                    <ArticleCard key={a.$id} article={a} />
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <Sidebar trendingArticles={trendingArticles} />
          </div>
        </div>
      </Layout>
    </>
  );
}

export async function getStaticProps() {
  try {
    const [latestRes, trendingRes] = await Promise.allSettled([
      getArticles({ limit: 12 }),
      getTrendingArticles(6),
    ]);

    const latestArticles = latestRes.status === 'fulfilled' ? latestRes.value.documents : [];
    const trendingArticles = trendingRes.status === 'fulfilled' ? trendingRes.value.documents : [];
    const heroArticle = latestArticles.find((a) => a?.featuredImage) || latestArticles[0] || null;
    const sideArticles = latestArticles.filter((a) => a?.$id !== heroArticle?.$id).slice(0, 4);

    return {
      props: {
        latestArticles,
        trendingArticles,
        heroArticle,
        sideArticles,
      },
      revalidate: 60,
    };
  } catch {
    return {
      props: {
        latestArticles: [],
        trendingArticles: [],
        heroArticle: null,
        sideArticles: [],
      },
      revalidate: 60,
    };
  }
}
