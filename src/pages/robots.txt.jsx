const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ceylonupdates.me';

function RobotsPage() {
  return null;
}

export async function getServerSideProps({ res }) {
  const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /search?*

User-agent: Googlebot
Allow: /
Disallow: /admin/

User-agent: Bingbot
Allow: /
Disallow: /admin/

Host: ${SITE_URL}
Sitemap: ${SITE_URL}/sitemap.xml
`;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, s-maxage=86400');
  res.write(robots);
  res.end();
  return { props: {} };
}

export default RobotsPage;
