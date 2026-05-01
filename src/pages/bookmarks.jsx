import { NextSeo } from 'next-seo';
import Layout from '../components/Layout';
import ArticleCard from '../components/ArticleCard';
import { useBookmarks } from '../hooks';
import Link from 'next/link';
import { FiBookmark, FiTrash2 } from 'react-icons/fi';

export default function BookmarksPage() {
  const { bookmarks, toggle } = useBookmarks();

  return (
    <>
      <NextSeo title="Saved Articles | CeylonUpdates.me" noindex />
      <Layout>
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-3 font-head text-3xl font-black text-stone-900 dark:text-neutral-50">
                <FiBookmark className="text-accent" size={28} />
                Saved Articles
              </h1>
              <p className="mt-1 text-sm text-stone-500 dark:text-neutral-500">
                {bookmarks.length} article{bookmarks.length !== 1 ? 's' : ''} saved locally on this
                device
              </p>
            </div>
            {bookmarks.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Clear all bookmarks?')) {
                    localStorage.removeItem('cu_bookmarks');
                    window.location.reload();
                  }
                }}
                className="flex items-center gap-2 text-sm text-stone-500 transition-colors hover:text-red-500"
              >
                <FiTrash2 size={14} /> Clear all
              </button>
            )}
          </div>

          {bookmarks.length === 0 ? (
            <div className="py-20 text-center">
              <FiBookmark size={48} className="mx-auto mb-4 text-stone-200 dark:text-neutral-700" />
              <h2 className="mb-2 font-head text-xl font-bold text-stone-600 dark:text-neutral-400">
                No saved articles yet
              </h2>
              <p className="mb-6 text-sm text-stone-400 dark:text-neutral-600">
                Click the Save button on any article to bookmark it for later reading.
              </p>
              <Link href="/" className="btn-primary px-6 py-2.5">
                Browse Articles →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bookmarks.map((article) => (
                <ArticleCard key={article.$id} article={article} />
              ))}
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
