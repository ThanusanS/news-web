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
    <div className="bg-accent rounded-xl p-8 text-white text-center">
      <h2 className="font-head text-2xl font-bold mb-2">
        <FiMail className="inline-block mr-2 -mt-0.5" size={22} />
        Daily Digest
      </h2>
      <p className="text-white/80 text-sm mb-6">
        Get the top 5 stories — Sri Lanka, AI & Tech — delivered every morning.
        <br />Join 6,840+ subscribers.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="flex-1 px-4 py-2.5 rounded bg-white/20 placeholder-white/60 text-white border border-white/30 focus:outline-none focus:border-white text-sm"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 px-4 py-2.5 rounded bg-white/20 placeholder-white/60 text-white border border-white/30 focus:outline-none focus:border-white text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-white text-accent font-bold text-sm rounded hover:bg-stone-100 transition-colors disabled:opacity-50"
        >
          {loading ? 'Joining...' : 'Subscribe Free'}
        </button>
      </form>
      <p className="text-white/50 text-xs mt-3">No spam. Unsubscribe anytime.</p>
    </div>
  );
}
