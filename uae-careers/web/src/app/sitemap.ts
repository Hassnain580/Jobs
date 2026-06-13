import type { MetadataRoute } from 'next';

const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://uaecareer.ae';

// Static pages — always included
const staticPages: MetadataRoute.Sitemap = [
  { url: base,                         lastModified: new Date(), priority: 1.0,  changeFrequency: 'daily'   },
  { url: `${base}/jobs`,               lastModified: new Date(), priority: 0.9,  changeFrequency: 'daily'   },
  { url: `${base}/companies`,          lastModified: new Date(), priority: 0.7,  changeFrequency: 'weekly'  },
  { url: `${base}/salary-guide`,       lastModified: new Date(), priority: 0.7,  changeFrequency: 'weekly'  },
  { url: `${base}/auth/login`,         lastModified: new Date(), priority: 0.3,  changeFrequency: 'monthly' },
  { url: `${base}/auth/register`,      lastModified: new Date(), priority: 0.3,  changeFrequency: 'monthly' },
  { url: `${base}/employer/post-job`,  lastModified: new Date(), priority: 0.6,  changeFrequency: 'monthly' },
];

// Category pages (auto-generated from the category registry)
const CATEGORIES = ['it', 'engineering', 'accounting', 'medical', 'sales', 'hr', 'construction', 'hospitality'];
const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map(slug => ({
  url: `${base}/jobs?category=${slug}`,
  lastModified: new Date(),
  priority: 0.8,
  changeFrequency: 'daily' as const,
}));

// Country/location pages
const COUNTRIES = ['ae', 'sa', 'qa', 'kw', 'om', 'bh'];
const locationPages: MetadataRoute.Sitemap = COUNTRIES.map(code => ({
  url: `${base}/jobs?country=${code}`,
  lastModified: new Date(),
  priority: 0.7,
  changeFrequency: 'daily' as const,
}));

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...staticPages,
    ...categoryPages,
    ...locationPages,
    // In production: fetch active job slugs from API and spread here
    // e.g. ...jobs.map(j => ({ url: `${base}/jobs/${j.slug}`, lastModified: new Date(j.updated_at), priority: 0.8 }))
  ];
}
