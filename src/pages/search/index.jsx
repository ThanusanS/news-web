import { useState } from 'react';
import { NextSeo } from 'next-seo';
import Layout from '../../components/Layout';
import ArticleCard from '../../components/ArticleCard';
import { databases, DB_ID, ARTICLES_COL, Query } from '../../lib/appwrite';
import { FiSearch } from 'react-icons/fi';

const POPULAR_SEARCHES = [
  'ChatGPT 2026', 'Sri Lanka news', 'AI tools', 'Python tutorial',
  'React 19', 'MERN stack', 'machine learning', 'Colombo tech',
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function doSearch(q) {
    const term = (q || query).trim();
    if (!term) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await databases.listDocuments(DB_ID, ARTICLES_COL, [
        Query.equal('status', 'published'),
        Query.search('title', term),
        Query.limit(20),
      ]);
      setResults(res.documents);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }

  return (
    <>
      <NextSeo
        title="Search Articles | CeylonUpdates.com"
        description="Search for Sri Lanka news, AI tutorials, tech articles and programming guides on CeylonUpdates.com"
      />
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-10">
          <h1 className="font-head text-3xl font-black mb-6 text-stone-900 dark:text-neutral-50">Search</h1>

          {/* Search bar */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && doSearch()}
                placeholder='Try "ChatGPT tutorial" or "Sri Lanka news"'
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-neutral-900 border-2 border-stone-200 dark:border-neutral-700 rounded-lg text-base text-stone-900 dark:text-neutral-100 focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <button onClick={() => doSearch()} className="btn-primary px-6 py-3 text-base">
              Search
            </button>
          </div>

          {/* Popular searches */}
          {!searched && (
            <div className="mb-8">
              <p className="text-xs text-stone-400 dark:text-neutral-600 mb-2">Popular searches:</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setQuery(s); doSearch(s); }}
                    className="tag-pill"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {loading && (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="text-center py-16 text-stone-400 dark:text-neutral-600">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-lg font-semibold mb-2">No results for "{query}"</p>
              <p className="text-sm">Try different keywords or browse our categories.</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <p className="text-sm text-stone-500 dark:text-neutral-500 mb-5">
                {results.length} result{results.length !== 1 ? 's' : ''} for "<strong>{query}</strong>"
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.map((a) => (
                  <ArticleCard key={a.$id} article={a} />
                ))}
              </div>
            </>
          )}
        </div>
      </Layout>
    </>
  );
}
