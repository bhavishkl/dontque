export default async function sitemap() {
  const baseUrl = 'https://dontque.vercel.app';

  // Core pages
  const routes = [
    '',
    '/features',
    '/pricing',
    '/case-studies',
    '/faq',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
} 