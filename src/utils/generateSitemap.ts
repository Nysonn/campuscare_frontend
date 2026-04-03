interface SitemapEntry {
  loc: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

const STATIC_PAGES: SitemapEntry[] = [
  { loc: 'https://campuscare.me', changefreq: 'daily', priority: 1.0 },
  { loc: 'https://campuscare.me/campaigns', changefreq: 'hourly', priority: 0.9 },
  { loc: 'https://campuscare.me/register/student', changefreq: 'monthly', priority: 0.7 },
  { loc: 'https://campuscare.me/register/counselor', changefreq: 'monthly', priority: 0.6 },
];

export function generateSitemap(lastmod?: string): string {
  const today = lastmod ?? new Date().toISOString().slice(0, 10);

  const urlEntries = STATIC_PAGES.map(
    ({ loc, changefreq, priority }) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`,
  ).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>`;
}
