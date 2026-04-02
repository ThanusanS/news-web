import { useState } from 'react';
import { FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Newsletter({ compact = false }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
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
    <div className="rounded-xl bg-accent p-8 text-center text-white">
      <h2 className="mb-2 font-head text-2xl font-bold">
        <FiMail className="-mt-0.5 mr-2 inline-block" size={22} />
        Daily Digest
      </h2>
      <p className="mb-6 text-sm text-white/80">
        Get the top 5 stories — Sri Lanka, AI & Tech — delivered every morning.
        <br />
        Join 6,840+ subscribers.
      </p>
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="flex-1 rounded border border-white/30 bg-white/20 px-4 py-2.5 text-sm text-white placeholder-white/60 focus:border-white focus:outline-none"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 rounded border border-white/30 bg-white/20 px-4 py-2.5 text-sm text-white placeholder-white/60 focus:border-white focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-white px-6 py-2.5 text-sm font-bold text-accent transition-colors hover:bg-stone-100 disabled:opacity-50"
        >
          {loading ? 'Joining...' : 'Subscribe Free'}
        </button>
      </form>
      <p className="mt-3 text-xs text-white/50">No spam. Unsubscribe anytime.</p>
    </div>
  );
}
