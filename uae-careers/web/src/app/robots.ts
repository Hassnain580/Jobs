import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://uaecareer.ae';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/secure-portal-9x4m7k/', '/auth/', '/api/', '/search?', '/?sort=', '/?filter='],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/jobs/', '/companies/', '/salary-guide/', '/blog/'],
      },
    ],
    sitemap: [
      `${base}/sitemap.xml`,
      `${base}/sitemap-jobs.xml`,
      `${base}/sitemap-companies.xml`,
    ],
  };
}
