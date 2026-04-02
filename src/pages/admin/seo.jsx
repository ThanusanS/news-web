import { useState } from 'react';
import Head from 'next/head';
import toast from 'react-hot-toast';
import { AdminLayout } from './index';

export default function SeoPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    siteTitle: 'CeylonUpdates.com — Latest Sri Lanka News, AI & Tech',
    siteDescription: 'Latest Sri Lanka news, AI tutorials, tech updates and programming guides. Trusted by 100K monthly readers.',
    gaId: '',
    adsenseId: '',
    twitterHandle: '@CeylonUpdates',
    fbAppId: '',
    indexing: true,
    canonicalDomain: 'https://ceylonupdates.com',
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
    toast.success('SEO settings saved!');
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <AdminLayout title="SEO Settings">
      <Head><title>SEO Settings | CeylonUpdates Admin</title></Head>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6">
        <form onSubmit={handleSave} className="space-y-4">
          {/* Site identity */}
          <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg p-5">
            <h2 className="font-semibold mb-4 pb-2 border-b border-stone-100 dark:border-neutral-800">Site Identity</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold tracking-wider text-stone-500 dark:text-neutral-500 uppercase mb-1.5">Site Meta Title</label>
                <input type="text" value={form.siteTitle} onChange={set('siteTitle')} className="form-input" maxLength={70} />
                <p className="text-xs text-stone-400 mt-0.5">{form.siteTitle.length}/70 chars</p>
              </div>
              <div>
                <label className="block text-xs font-bold tracking-wider text-stone-500 dark:text-neutral-500 uppercase mb-1.5">Site Meta Description</label>
                <textarea value={form.siteDescription} onChange={set('siteDescription')} className="form-input resize-none" rows={3} maxLength={160} />
                <p className="text-xs text-stone-400 mt-0.5">{form.siteDescription.length}/160 chars</p>
              </div>
              <div>
                <label className="block text-xs font-bold tracking-wider text-stone-500 dark:text-neutral-500 uppercase mb-1.5">Canonical Domain</label>
                <input type="text" value={form.canonicalDomain} onChange={set('canonicalDomain')} className="form-input" />
              </div>
            </div>
          </div>

          {/* Analytics & Ads */}
          <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg p-5">
            <h2 className="font-semibold mb-4 pb-2 border-b border-stone-100 dark:border-neutral-800">Analytics & AdSense</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold tracking-wider text-stone-500 dark:text-neutral-500 uppercase mb-1.5">Google Analytics ID</label>
                <input type="text" value={form.gaId} onChange={set('gaId')} placeholder="G-XXXXXXXXXX" className="form-input font-mono" />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-wider text-stone-500 dark:text-neutral-500 uppercase mb-1.5">AdSense Publisher ID</label>
                <input type="text" value={form.adsenseId} onChange={set('adsenseId')} placeholder="ca-pub-XXXXXXXXXXXXXXXX" className="form-input font-mono" />
              </div>
            </div>
          </div>

          {/* Social */}
          <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg p-5">
            <h2 className="font-semibold mb-4 pb-2 border-b border-stone-100 dark:border-neutral-800">Social Profiles</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold tracking-wider text-stone-500 dark:text-neutral-500 uppercase mb-1.5">Twitter Handle</label>
                <input type="text" value={form.twitterHandle} onChange={set('twitterHandle')} placeholder="@YourHandle" className="form-input" />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-wider text-stone-500 dark:text-neutral-500 uppercase mb-1.5">Facebook App ID</label>
                <input type="text" value={form.fbAppId} onChange={set('fbAppId')} placeholder="1234567890" className="form-input" />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-2.5">
            {saved ? '✓ Saved!' : 'Save SEO Settings'}
          </button>
        </form>

        {/* Sidebar tools */}
        <div className="space-y-4">
          {/* Score */}
          <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-3">SEO Health</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="font-head font-black text-2xl text-green-600">87</div>
                <div className="text-xs text-stone-500">SEO Score</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <div className="font-head font-black text-2xl text-yellow-600">73</div>
                <div className="text-xs text-stone-500">Page Speed</div>
              </div>
            </div>
          </div>

          {/* Generate files */}
          <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-3">Generate Files</h3>
            <div className="space-y-2">
              {[
                { label: '🗺 Generate sitemap.xml', note: 'Auto-includes all published URLs' },
                { label: '🤖 Generate robots.txt', note: 'Blocks admin, allows all crawlers' },
                { label: '📊 Submit to Search Console', note: 'Ping Google after new posts' },
              ].map((item) => (
                <button key={item.label} onClick={() => toast.success(`${item.label} — done!`)} className="w-full text-left p-3 bg-stone-50 dark:bg-neutral-800 rounded-lg hover:bg-accent hover:text-white group transition-all">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-stone-400 group-hover:text-white/70 mt-0.5">{item.note}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-3">Target Keywords</h3>
            <div className="space-y-1.5">
              {[
                { kw: 'latest news Sri Lanka', vol: '22K/mo' },
                { kw: 'AI tools 2026', vol: '14K/mo' },
                { kw: 'how to use ChatGPT', vol: '40K/mo' },
                { kw: 'MERN stack tutorial', vol: '8K/mo' },
                { kw: 'Python beginner 2026', vol: '12K/mo' },
              ].map((k) => (
                <div key={k.kw} className="flex items-center justify-between text-xs">
                  <span className="text-stone-600 dark:text-neutral-400">{k.kw}</span>
                  <span className="font-mono text-green-600 bg-green-50 dark:bg-green-950/20 px-1.5 py-0.5 rounded">{k.vol}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
