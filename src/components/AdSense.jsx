import { useEffect } from 'react';

// Replace data-ad-* values with your real AdSense IDs
const PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || 'ca-pub-XXXXXXXXXXXXXXXX';

const SLOTS = {
  leaderboard: { slot: '1234567890', width: 728, height: 90, label: '728×90 Leaderboard' },
  rectangle:   { slot: '0987654321', width: 300, height: 250, label: '300×250 Rectangle' },
  halfPage:    { slot: '1122334455', width: 300, height: 600, label: '300×600 Half Page' },
  inArticle:   { slot: '5544332211', width: 728, height: 90, label: '728×90 In-Article' },
  mobile:      { slot: '9988776655', width: 320, height: 100, label: '320×100 Mobile' },
};

export default function AdSense({ type = 'rectangle', className = '' }) {
  const config = SLOTS[type] || SLOTS.rectangle;

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {}
  }, []);

  // In development, show placeholder
  if (process.env.NODE_ENV === 'development') {
    return (
      <div
        className={`ad-zone ${className}`}
        style={{ width: '100%', maxWidth: config.width, height: config.height, margin: '0 auto' }}
      >
        <span className="text-[9px] font-bold tracking-widest opacity-50">ADVERTISEMENT</span>
        <span>{config.label} · Google AdSense</span>
      </div>
    );
  }

  return (
    <div className={className} style={{ textAlign: 'center' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: config.width, height: config.height }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={config.slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
