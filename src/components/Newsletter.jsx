import { useState } from 'react';
import { FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Newsletter({ compact = false }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Subscription failed. Please try again.');
      }

      toast.success('Subscribed! Check your inbox for confirmation.');
      setEmail('');
      setName('');
    } catch (err) {
      toast.error(err.message || 'Subscription failed. Please try again.');
    }
    setLoading(false);
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="form-input flex-1"
          required
        />
        <button type="submit" disabled={loading} className="btn-primary shrink-0">
          {loading ? '...' : 'Subscribe'}
        </button>
      </form>
    );
  }

  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-stone-200 bg-stone-50 p-5 text-center text-stone-900 shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 md:p-6">
      <h2 className="mb-2 font-head text-xl font-bold md:text-2xl">
        <FiMail className="-mt-0.5 mr-2 inline-block" size={22} />
        Daily Digest
      </h2>
      <p className="mb-5 text-sm text-stone-600 dark:text-neutral-300">
        Get the top 5 stories — Sri Lanka, AI & Tech — delivered every morning.
        <br />
        Join our newsletter.
      </p>
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="flex-1 rounded border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-accent focus:outline-none dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 rounded border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-accent focus:outline-none dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-accent px-6 py-2.5 text-sm font-bold text-white transition-colors hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Joining...' : 'Subscribe Free'}
        </button>
      </form>
      <p className="mt-3 text-xs text-stone-500 dark:text-neutral-400">
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
