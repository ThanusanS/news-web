import { FiAlertCircle } from 'react-icons/fi';

export default function BreakingTicker({ items = [] }) {
  const defaultItems = [
    'Sri Lanka GDP grows 4.2% in Q1 2026, beats IMF projections',
    'OpenAI releases GPT-5 with 10x reasoning capability',
    'Google announces Gemini Ultra 2 — multimodal AI breakthrough',
    'Port City Colombo opens first international tech hub with 5,000 jobs',
    'Tesla $25K EV launches in South Asia — Sri Lanka among first markets',
    'Apple WWDC 2026: M5 chip and AI-native iOS 20 unveiled',
  ];
  const tickerItems = items.length ? items : defaultItems;
  const doubled = [...tickerItems, ...tickerItems];

  return (
    <div className="hidden md:flex h-7 items-center overflow-hidden bg-gradient-to-r from-navy via-accent to-accent2 text-white">
      <div className="flex h-full shrink-0 items-center whitespace-nowrap bg-black/25 px-4 text-[10px] font-black tracking-[2px]">
        <FiAlertCircle className="mr-1.5" size={11} />
        BREAKING
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="ticker-anim flex gap-8 whitespace-nowrap py-1 pl-6 text-[11px] font-medium">
          {doubled.map((item, i) => (
            <span key={i} className="flex items-center gap-2">
              {item}
              <span className="opacity-50">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
