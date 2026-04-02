import { useState } from 'react';
import toast from 'react-hot-toast';
import { subscribeEmail } from '../lib/appwrite';

export default function Newsletter({ compact = false }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await subscribeEmail(email, name);
      toast.success('Subscribed! Check your inbox for confirmation.');
      setEmail('');
      setName('');
    } catch (err) {
      // Duplicate email is common
      toast.error('Already subscribed or invalid email.');
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
      <h2 className="font-head text-2xl font-bold mb-2">📬 Daily Digest</h2>
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
          {loading ? 'Joining...' : 'Subscribe Free →'}
        </button>
      </form>
      <p className="text-white/50 text-xs mt-3">No spam. Unsubscribe anytime.</p>
    </div>
  );
}
