function AdsTxtPage() {
  return null;
}

export async function getServerSideProps({ res }) {
  const publisher =
    process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || process.env.ADSENSE_PUBLISHER_ID || '';
  const pubId = publisher.replace(/^ca-/, '');

  const body = pubId ? `google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n` : '';

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=3600');
  res.write(body);
  res.end();

  return { props: {} };
}

export default AdsTxtPage;
