import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';

export default function AdminPreviewPage() {
  const [draft, setDraft] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const key = params.get('key') || '';
      if (!key) {
        setDraft(null);
        setReady(true);
        return;
      }

      const raw = sessionStorage.getItem(key) || localStorage.getItem(key);
      if (!raw) {
        setDraft(null);
        setReady(true);
        return;
      }

      const parsed = JSON.parse(raw);
      setDraft(parsed);
      setReady(true);
    } catch {
      setDraft(null);
      setReady(true);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Draft Preview | CeylonUpdates Admin</title>
      </Head>

      <main className="min-h-screen bg-stone-100 px-4 py-8 dark:bg-neutral-950">
        <div className="mx-auto max-w-4xl rounded-xl border border-stone-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-6 flex items-center justify-between gap-3 border-b border-stone-200 pb-4 dark:border-neutral-800">
            <h1 className="font-head text-2xl font-black text-stone-900 dark:text-neutral-100">
              Draft Preview
            </h1>
            <Link
              href="/admin/posts"
              className="rounded border border-stone-300 px-3 py-1.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              Back to Admin
            </Link>
          </div>

          {!ready ? (
            <p className="text-sm text-stone-500 dark:text-neutral-400">Loading preview...</p>
          ) : !draft ? (
            <p className="text-sm text-stone-500 dark:text-neutral-400">
              No preview draft found. Open preview from the editor again.
            </p>
          ) : (
            <article>
              {draft.featuredImage && (
                <img
                  src={draft.featuredImage}
                  alt={draft.title || 'Preview image'}
                  className="mb-5 aspect-video w-full rounded-lg object-cover"
                />
              )}

              <h2 className="mb-2 font-head text-3xl font-black text-stone-900 dark:text-neutral-100">
                {draft.title || 'Untitled draft'}
              </h2>

              {(draft.author || draft.category) && (
                <p className="mb-4 text-xs uppercase tracking-wider text-stone-500 dark:text-neutral-400">
                  {draft.author || 'Unknown author'}
                  {draft.category ? ` · ${draft.category}` : ''}
                </p>
              )}

              {draft.excerpt && (
                <p className="mb-6 text-base leading-relaxed text-stone-600 dark:text-neutral-300">
                  {draft.excerpt}
                </p>
              )}

              <div
                className="article-prose"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(String(draft.content || ''), {
                    ADD_ATTR: ['target', 'rel', 'class'],
                  }),
                }}
              />
            </article>
          )}
        </div>
      </main>
    </>
  );
}