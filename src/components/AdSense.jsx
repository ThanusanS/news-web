import { useEffect, useRef, useState } from 'react';

// Replace data-ad-* values with your real AdSense IDs
const PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || 'ca-pub-XXXXXXXXXXXXXXXX';

const SLOTS = {
  leaderboard: { slot: '1234567890', width: 728, height: 90, label: '728×90 Leaderboard' },
  rectangle: { slot: '0987654321', width: 300, height: 250, label: '300×250 Rectangle' },
  halfPage: { slot: '1122334455', width: 300, height: 600, label: '300×600 Half Page' },
  inArticle: { slot: '5544332211', width: 728, height: 90, label: '728×90 In-Article' },
  mobile: { slot: '9988776655', width: 320, height: 100, label: '320×100 Mobile' },
};

export default function AdSense({ type = 'rectangle', className = '' }) {
  const config = SLOTS[type] || SLOTS.rectangle;
  const adRef = useRef(null);
  const [isFilled, setIsFilled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV === 'development') return;

    const insEl = adRef.current;
    if (!insEl) return;

    const updateFillState = () => {
      const status = insEl.getAttribute('data-ad-status');
      setIsFilled(status === 'filled');
    };

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});

      // AdSense updates data-ad-status asynchronously (filled/unfilled).
      const observer = new MutationObserver(updateFillState);
      observer.observe(insEl, { attributes: true, attributeFilter: ['data-ad-status'] });

      const timer = window.setTimeout(updateFillState, 2000);

      return () => {
        window.clearTimeout(timer);
        observer.disconnect();
      };
    } catch {
      setIsFilled(false);
      return undefined;
    }
  }, []);

  // Hide ads in development to avoid empty placeholder blocks.
  if (process.env.NODE_ENV === 'development') {
    return null;
  }

  const hasRealPublisherId = !PUBLISHER_ID.includes('XXXXXXXX');
  if (!hasRealPublisherId) {
    return null;
  }

  return (
    <div
      className={className}
      style={{
        textAlign: 'center',
        display: isFilled ? 'block' : 'none',
      }}
      aria-hidden={!isFilled}
    >
      <ins
        ref={adRef}
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
