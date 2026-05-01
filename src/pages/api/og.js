// Dynamic Open Graph image generator
// Returns SVG-based OG image for social sharing
export default function handler(req, res) {
  const { title = 'CeylonUpdates.me', category = 'News' } = req.query;

  const safeTitle = String(title)
    .slice(0, 80)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const categoryLabelMap = {
    'ai-tutorials': 'AI & Innovation',
  };
  const rawCategory = String(category || 'News');
  const labelSource = categoryLabelMap[rawCategory] || rawCategory.replace(/-/g, ' ');
  const safeCat = String(labelSource).toUpperCase().slice(0, 30);

  const catColors = {
    'sri lanka': '#C8102E',
    'tech news': '#1A3A5C',
    sports: '#047857',
    'ai-tutorials': '#4338CA',
    'jobs careers': '#C2410C',
    education: '#0369A1',
    programming: '#15803D',
    world: '#7C3AED',
    business: '#B45309',
  };
  const normalizedKey = rawCategory.toLowerCase();
  const bgColor = catColors[normalizedKey] || '#C8102E';

  // Word-wrap title for SVG (max ~45 chars per line)
  const words = safeTitle.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).length > 44) {
      lines.push(line.trim());
      line = word;
    } else line += ' ' + word;
  }
  if (line) lines.push(line.trim());
  const titleLines = lines.slice(0, 3);

  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#0a0a0a;stop-opacity:1"/>
    </linearGradient>
    <linearGradient id="overlay" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#000;stop-opacity:0"/>
      <stop offset="100%" style="stop-color:#000;stop-opacity:0.5"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#overlay)"/>

  <!-- Grid pattern -->
  <g opacity="0.05">
    ${Array.from({ length: 20 }, (_, i) => `<line x1="${i * 63}" y1="0" x2="${i * 63}" y2="630" stroke="white" stroke-width="1"/>`).join('')}
    ${Array.from({ length: 10 }, (_, i) => `<line x1="0" y1="${i * 70}" x2="1200" y2="${i * 70}" stroke="white" stroke-width="1"/>`).join('')}
  </g>

  <!-- Left accent bar -->
  <rect x="80" y="120" width="6" height="80" fill="white" rx="3"/>

  <!-- Category badge -->
  <rect x="80" y="230" width="${safeCat.length * 14 + 32}" height="36" rx="4" fill="white" fill-opacity="0.2"/>
  <text x="96" y="254" font-family="Georgia, serif" font-size="14" font-weight="700" fill="white" letter-spacing="3">${safeCat}</text>

  <!-- Title -->
  ${titleLines.map((line, i) => `<text x="80" y="${310 + i * 72}" font-family="Georgia, serif" font-size="58" font-weight="700" fill="white" opacity="${1 - i * 0.05}">${line}</text>`).join('')}

  <!-- Site name -->
  <text x="80" y="570" font-family="Georgia, serif" font-size="28" font-weight="900" fill="white" opacity="0.9">Ceylon<tspan fill="${bgColor === '#C8102E' ? '#FF6B6B' : '#FF6B35'}">Updates</tspan>.me</text>
  <text x="80" y="600" font-family="Arial, sans-serif" font-size="16" fill="white" opacity="0.5">Sri Lanka News · AI · Tech · Programming</text>

  <!-- Right decoration -->
  <circle cx="1050" cy="200" r="180" fill="white" fill-opacity="0.04"/>
  <circle cx="1100" cy="450" r="120" fill="white" fill-opacity="0.04"/>
  <text x="980" y="220" font-size="120" opacity="0.15">CU</text>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  return res.status(200).send(svg);
}
