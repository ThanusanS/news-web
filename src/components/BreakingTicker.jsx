import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FiAlertCircle } from 'react-icons/fi';

function toTickerItem(entry) {
  if (!entry) return null;
  if (typeof entry === 'string') return { title: entry, href: null };
  if (typeof entry === 'object' && entry.title) {
    return {
      title: String(entry.title),
      href: entry.slug ? `/${entry.slug}` : null,
    };
  }
  return null;
}

export default function BreakingTicker({ items = [] }) {
  const [liveItems, setLiveItems] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function loadBreakingNews() {
      // Respect explicit items passed by a parent component.
      if (items.length) {
        const normalized = items.map(toTickerItem).filter(Boolean);
        if (mounted) setLiveItems(normalized);
        return;
      }

      try {
        const res = await fetch('/api/articles?limit=8&status=published&sort=publishedAt');
        if (!res.ok) return;

        const data = await res.json();
        const normalized = (data?.documents || [])
          .map((doc) => toTickerItem({ title: doc.title, slug: doc.slug }))
          .filter(Boolean);

        if (mounted) setLiveItems(normalized);
      } catch {
        if (mounted) setLiveItems([]);
      }
    }

    loadBreakingNews();
    return () => {
      mounted = false;
    };
  }, [items]);

  const tickerItems = useMemo(() => {
    if (liveItems.length) return liveItems;
    return [{ title: 'No breaking updates yet.', href: null }];
  }, [liveItems]);

  const doubled = [...tickerItems, ...tickerItems];

  return (
    <div className="flex h-7 items-center overflow-hidden bg-gradient-to-r from-navy via-accent to-accent2 text-white">
      <div className="flex h-full shrink-0 items-center whitespace-nowrap bg-black/25 px-4 text-[10px] font-black tracking-[2px]">
        <FiAlertCircle className="mr-1.5" size={11} />
        BREAKING
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="ticker-anim flex gap-8 whitespace-nowrap py-1 pl-6 text-[11px] font-medium">
          {doubled.map((item, i) => (
            <span key={`${item.title}-${i}`} className="flex items-center gap-2">
              {item.href ? (
                <Link href={item.href} className="hover:underline">
                  {item.title}
                </Link>
              ) : (
                <span>{item.title}</span>
              )}
              <span className="opacity-50">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
