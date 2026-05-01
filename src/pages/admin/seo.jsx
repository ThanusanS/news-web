import { useState } from 'react';
import Head from 'next/head';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import { FiCheck, FiMap, FiCpu, FiBarChart2 } from 'react-icons/fi';

export default function SeoPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    siteTitle: 'CeylonUpdates.me — Latest Sri Lanka News, AI & Tech',
    siteDescription:
      'Latest Sri Lanka news, AI & Innovation, tech updates and programming guides. Trusted by 100K monthly readers.',
    gaId: '',
    adsenseId: '',
    twitterHandle: '@CeylonUpdates',
    fbAppId: '',
    indexing: true,
    canonicalDomain: 'https://www.ceylonupdates.me',
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
      <Head>
        <title>SEO Settings | CeylonUpdates Admin</title>
      </Head>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
        <form onSubmit={handleSave} className="space-y-4">
          {/* Site identity */}
          <div className="rounded-lg border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="mb-4 border-b border-stone-100 pb-2 font-semibold dark:border-neutral-800">
              Site Identity
            </h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
                  Site Meta Title
                </label>
                <input
                  type="text"
                  value={form.siteTitle}
                  onChange={set('siteTitle')}
                  className="form-input"
                  maxLength={70}
                />
                <p className="mt-0.5 text-xs text-stone-400">{form.siteTitle.length}/70 chars</p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
                  Site Meta Description
                </label>
                <textarea
                  value={form.siteDescription}
                  onChange={set('siteDescription')}
                  className="form-input resize-none"
                  rows={3}
                  maxLength={160}
                />
                <p className="mt-0.5 text-xs text-stone-400">
                  {form.siteDescription.length}/160 chars
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
                  Canonical Domain
                </label>
                <input
                  type="text"
                  value={form.canonicalDomain}
                  onChange={set('canonicalDomain')}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Analytics & Ads */}
          <div className="rounded-lg border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="mb-4 border-b border-stone-100 pb-2 font-semibold dark:border-neutral-800">
              Analytics & AdSense
            </h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
                  Google Analytics ID
                </label>
                <input
                  type="text"
                  value={form.gaId}
                  onChange={set('gaId')}
                  placeholder="G-XXXXXXXXXX"
                  className="form-input font-mono"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
                  AdSense Publisher ID
                </label>
                <input
                  type="text"
                  value={form.adsenseId}
                  onChange={set('adsenseId')}
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  className="form-input font-mono"
                />
              </div>
            </div>
          </div>

          {/* Social */}
          <div className="rounded-lg border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="mb-4 border-b border-stone-100 pb-2 font-semibold dark:border-neutral-800">
              Social Profiles
            </h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
                  Twitter Handle
                </label>
                <input
                  type="text"
                  value={form.twitterHandle}
                  onChange={set('twitterHandle')}
                  placeholder="@YourHandle"
                  className="form-input"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
                  Facebook App ID
                </label>
                <input
                  type="text"
                  value={form.fbAppId}
                  onChange={set('fbAppId')}
                  placeholder="1234567890"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-2.5">
            {saved ? (
              <span className="inline-flex items-center gap-1.5">
                <FiCheck size={14} /> Saved
              </span>
            ) : (
              'Save SEO Settings'
            )}
          </button>
        </form>

        {/* Sidebar tools */}
        <div className="space-y-4">
          {/* Score */}
          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-3 text-sm font-semibold">SEO Health</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-green-50 p-3 text-center dark:bg-green-950/20">
                <div className="font-head text-2xl font-black text-green-600">87</div>
                <div className="text-xs text-stone-500">SEO Score</div>
              </div>
              <div className="rounded-lg bg-yellow-50 p-3 text-center dark:bg-yellow-950/20">
                <div className="font-head text-2xl font-black text-yellow-600">73</div>
                <div className="text-xs text-stone-500">Page Speed</div>
              </div>
            </div>
          </div>

          {/* Generate files */}
          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-3 text-sm font-semibold">Generate Files</h3>
            <div className="space-y-2">
              {[
                {
                  label: 'Generate sitemap.xml',
                  note: 'Auto-includes all published URLs',
                  Icon: FiMap,
                },
                {
                  label: 'Generate robots.txt',
                  note: 'Blocks admin, allows all crawlers',
                  Icon: FiCpu,
                },
                {
                  label: 'Submit to Search Console',
                  note: 'Ping Google after new posts',
                  Icon: FiBarChart2,
                },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => toast.success(`${item.label} — done!`)}
                  className="group w-full rounded-lg bg-stone-50 p-3 text-left transition-all hover:bg-accent hover:text-white dark:bg-neutral-800"
                >
                  <div className="inline-flex items-center gap-2 text-sm font-medium">
                    <item.Icon size={14} /> {item.label}
                  </div>
                  <div className="mt-0.5 text-xs text-stone-400 group-hover:text-white/70">
                    {item.note}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-3 text-sm font-semibold">Target Keywords</h3>
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
                  <span className="rounded bg-green-50 px-1.5 py-0.5 font-mono text-green-600 dark:bg-green-950/20">
                    {k.vol}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
