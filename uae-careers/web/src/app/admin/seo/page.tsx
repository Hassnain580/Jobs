'use client';

import { useState, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab =
  | 'dashboard' | 'global' | 'onpage' | 'schema'
  | 'technical' | 'sitemap' | 'redirects' | 'social'
  | 'webmaster' | 'multilingual' | 'keywords' | 'reports' | 'registry';

interface Redirect { id: number; source: string; destination: string; type: 301 | 302 | 410; hits: number; status: 'active' | 'inactive'; created: string; }
interface Keyword { id: number; keyword: string; target: string; engine: string; lang: string; position: number | null; change: number; }
interface ContentType { key: string; label: string; urlPattern: string; schema: string; sitemap: string; status: 'active' | 'pending' | 'inactive'; records: number; missingMeta: number; }

// ─── Tab bar config ───────────────────────────────────────────────────────────
const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'dashboard',    icon: '📊', label: 'Dashboard' },
  { id: 'global',       icon: '⚙️', label: 'Global Settings' },
  { id: 'onpage',       icon: '📝', label: 'On-Page Manager' },
  { id: 'schema',       icon: '🔖', label: 'Schema / JSON-LD' },
  { id: 'technical',    icon: '🔧', label: 'Technical SEO' },
  { id: 'sitemap',      icon: '🗺️', label: 'Sitemap' },
  { id: 'redirects',    icon: '🔀', label: 'Redirects & 404' },
  { id: 'social',       icon: '📱', label: 'Social / OG' },
  { id: 'webmaster',    icon: '🔗', label: 'Webmaster Tools' },
  { id: 'multilingual', icon: '🌍', label: 'Multilingual' },
  { id: 'keywords',     icon: '📈', label: 'Keyword Tracker' },
  { id: 'reports',      icon: '📋', label: 'Reports & Logs' },
  { id: 'registry',     icon: '⚡', label: 'Content Registry' },
];

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 py-3 border-b border-gray-100 last:border-0">
      <div className="sm:w-52 shrink-0">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]';

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-[#1A3C6E]' : 'bg-gray-300'}`}>
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function SaveBtn({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return (
    <button onClick={onClick} disabled={saving}
      className="rounded-lg bg-[#1A3C6E] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0d2444] disabled:opacity-50 transition-colors">
      {saving ? 'Saving…' : 'Save Changes'}
    </button>
  );
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  const colors: Record<string, string> = {
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    red:   'bg-red-100 text-red-700',
    gray:  'bg-gray-100 text-gray-600',
    blue:  'bg-blue-100 text-blue-700',
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>{label}</span>;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_REDIRECTS: Redirect[] = [
  { id: 1, source: '/jobs/php-dev-dubai-old', destination: '/jobs/senior-php-developer-dubai', type: 301, hits: 234, status: 'active', created: '2026-06-01' },
  { id: 2, source: '/jobs/nurse-abu-dhabi-2025', destination: '/jobs/category/healthcare', type: 301, hits: 87, status: 'active', created: '2026-05-20' },
  { id: 3, source: '/marketing-manager-ksa', destination: '/jobs/marketing-manager-riyadh', type: 302, hits: 12, status: 'inactive', created: '2026-06-10' },
  { id: 4, source: '/jobs/expired-driver-job', destination: '', type: 410, hits: 45, status: 'active', created: '2026-06-05' },
];

const MOCK_404s = [
  { url: '/jobs/civil-engineer-sharjah-2024', referrer: 'google.com', hits: 89, last_seen: '2026-06-13' },
  { url: '/companies/techcorp', referrer: 'linkedin.com', hits: 34, last_seen: '2026-06-12' },
  { url: '/jobs/category/it-jobs', referrer: 'direct', hits: 21, last_seen: '2026-06-13' },
];

const MOCK_KEYWORDS: Keyword[] = [
  { id: 1, keyword: 'jobs in Dubai', target: '/jobs?city=dubai', engine: 'google.ae', lang: 'en', position: 4, change: 2 },
  { id: 2, keyword: 'nurse jobs UAE', target: '/jobs/category/healthcare', engine: 'google.ae', lang: 'en', position: 7, change: -1 },
  { id: 3, keyword: 'وظائف دبي', target: '/ar/jobs?city=dubai', engine: 'google.ae', lang: 'ar', position: 12, change: 3 },
  { id: 4, keyword: 'civil engineer Abu Dhabi', target: '/jobs?q=civil+engineer&city=abu-dhabi', engine: 'google.ae', lang: 'en', position: 9, change: 0 },
  { id: 5, keyword: 'walk in interview Dubai', target: '/jobs?type=walk_in', engine: 'google.ae', lang: 'en', position: 3, change: 5 },
];

const MOCK_CONTENT_TYPES: ContentType[] = [
  { key: 'jobs',       label: 'Job Listings',     urlPattern: '/jobs/{slug}',              schema: 'JobPosting',    sitemap: 'sitemap-jobs.xml',       status: 'active',  records: 4823, missingMeta: 72 },
  { key: 'companies',  label: 'Company Profiles',  urlPattern: '/companies/{slug}',         schema: 'Organization',  sitemap: 'sitemap-companies.xml',  status: 'active',  records: 347,  missingMeta: 0  },
  { key: 'categories', label: 'Job Categories',    urlPattern: '/jobs/category/{slug}',     schema: 'ItemList',      sitemap: 'sitemap-categories.xml', status: 'active',  records: 34,   missingMeta: 0  },
  { key: 'locations',  label: 'Location Pages',    urlPattern: '/jobs/{country}/{city}',    schema: 'Place',         sitemap: 'sitemap-locations.xml',  status: 'active',  records: 12,   missingMeta: 0  },
  { key: 'blog',       label: 'Blog / Articles',   urlPattern: '/blog/{slug}',              schema: 'Article',       sitemap: 'sitemap-blog.xml',       status: 'active',  records: 89,   missingMeta: 4  },
  { key: 'salary',     label: 'Salary Guides',     urlPattern: '/salary-guide/{role}',      schema: 'Article',       sitemap: 'sitemap-salary.xml',     status: 'pending', records: 0,    missingMeta: 0  },
];

const SEO_CHECKLIST = [
  { ok: true,  label: 'XML Sitemap generated & submitted' },
  { ok: false, label: 'Google Search Console connected' },
  { ok: true,  label: 'Robots.txt configured' },
  { ok: false, label: 'Hreflang tags not configured' },
  { ok: true,  label: 'JobPosting schema active on job pages' },
  { ok: false, label: '72 job listings missing meta descriptions' },
  { ok: true,  label: 'HTTPS forced on canonical URLs' },
  { ok: false, label: 'Bing Webmaster not connected' },
  { ok: true,  label: 'IndexNow API key configured' },
  { ok: true,  label: 'Open Graph default image set' },
  { ok: false, label: '5 broken internal links detected' },
  { ok: true,  label: 'BreadcrumbList schema active' },
];

// ─── Score calculation ─────────────────────────────────────────────────────────
const SEO_SCORE = Math.round((SEO_CHECKLIST.filter(c => c.ok).length / SEO_CHECKLIST.length) * 100);

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminSEOPage() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // ── Global settings state ───────────────────────────────────────────────────
  const [siteName,        setSiteName]        = useState('UAE Careers');
  const [tagline,         setTagline]         = useState('Find Your Dream Job in the Gulf');
  const [orgType,         setOrgType]         = useState('Organization');
  const [orgPhone,        setOrgPhone]        = useState('+971 4 123 4567');
  const [orgAddress,      setOrgAddress]      = useState('Business Bay, Dubai, UAE');
  const [primaryLang,     setPrimaryLang]     = useState('Both');
  const [currency,        setCurrency]        = useState('AED');
  const [defaultRobots,   setDefaultRobots]   = useState('index,follow');
  const [noindexExpired,  setNoindexExpired]  = useState(true);
  const [noindexSearch,   setNoindexSearch]   = useState(true);
  const [forceHTTPS,      setForceHTTPS]      = useState(true);
  const [trailingSlash,   setTrailingSlash]   = useState(false);

  // ── Technical SEO state ─────────────────────────────────────────────────────
  const [robotsTxt, setRobotsTxt] = useState(`User-agent: *
Disallow: /admin/
Disallow: /api/
Disallow: /search?
Disallow: /?sort=
Disallow: /?filter=
Allow: /

User-agent: Googlebot
Allow: /jobs/
Allow: /companies/

Sitemap: https://uaecareer.ae/sitemap.xml
Sitemap: https://uaecareer.ae/sitemap-jobs.xml`);

  const [indexnowKey,      setIndexnowKey]      = useState('a7f3d9k2p5m8q1r4');
  const [autoIndexNow,     setAutoIndexNow]     = useState(true);
  const [googleIndexingAPI, setGoogleIndexingAPI] = useState(false);
  const [llmsTxt, setLlmsTxt] = useState(`# UAE Careers - Jobs Portal
## What this site is
UAE Careers is a job board for the GCC/MENA region listing jobs in UAE, Saudi Arabia, Qatar, Kuwait, Oman and Bahrain.

## Key content
- /jobs/ - All job listings (4,823 active jobs)
- /companies/ - Company profiles (347 companies)
- /salary-guide/ - Salary guides by role and region
- /blog/ - Career advice articles

## Preferred citation format
"{Job Title} at {Company Name}, {City}" via UAE Careers (uaecareer.ae)`);

  // ── Social state ────────────────────────────────────────────────────────────
  const [defaultOGImage, setDefaultOGImage] = useState('');
  const [twitterHandle,  setTwitterHandle]  = useState('@UAECareers');
  const [fbAppId,        setFbAppId]        = useState('');
  const [linkedInUrl,    setLinkedInUrl]    = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('+971 55 123 4567');

  // ── Webmaster state ─────────────────────────────────────────────────────────
  const [gscCode,     setGscCode]     = useState('');
  const [bingCode,    setBingCode]    = useState('');
  const [yandexCode,  setYandexCode]  = useState('');
  const [gtmId,       setGtmId]       = useState('');
  const [ga4Id,       setGa4Id]       = useState('');

  // ── Multilingual state ──────────────────────────────────────────────────────
  const [primaryLocale,   setPrimaryLocale]   = useState('en-ae');
  const [enableHreflang,  setEnableHreflang]  = useState(false);
  const [arabicSlugStyle, setArabicSlugStyle] = useState('transliterated');

  // ── Redirects state ─────────────────────────────────────────────────────────
  const [redirects,    setRedirects]    = useState<Redirect[]>(MOCK_REDIRECTS);
  const [newSource,    setNewSource]    = useState('');
  const [newDest,      setNewDest]      = useState('');
  const [newType,      setNewType]      = useState<301 | 302 | 410>(301);

  // ── Keywords state ──────────────────────────────────────────────────────────
  const [keywords,    setKeywords]    = useState<Keyword[]>(MOCK_KEYWORDS);
  const [newKeyword,  setNewKeyword]  = useState('');
  const [newKwTarget, setNewKwTarget] = useState('');

  // ── Sitemap state ───────────────────────────────────────────────────────────
  const [sitemapConfig] = useState([
    { file: 'sitemap-jobs.xml',       enabled: true,  priority: '0.8', freq: 'daily',   lastGen: '2026-06-13 14:22' },
    { file: 'sitemap-companies.xml',  enabled: true,  priority: '0.6', freq: 'weekly',  lastGen: '2026-06-13 14:22' },
    { file: 'sitemap-categories.xml', enabled: true,  priority: '0.7', freq: 'weekly',  lastGen: '2026-06-13 14:22' },
    { file: 'sitemap-locations.xml',  enabled: true,  priority: '0.7', freq: 'weekly',  lastGen: '2026-06-13 14:22' },
    { file: 'sitemap-blog.xml',       enabled: true,  priority: '0.6', freq: 'weekly',  lastGen: '2026-06-12 09:10' },
    { file: 'sitemap-salary.xml',     enabled: false, priority: '0.5', freq: 'monthly', lastGen: '—' },
  ]);

  // ── Schema state ───────────────────────────────────────────────────────────
  const [schemaToggles, setSchemaToggles] = useState({
    website:      true,
    breadcrumb:   true,
    jobPosting:   true,
    organization: true,
    faqPage:      false,
    newsArticle:  false,
  });

  // ── Meta templates ──────────────────────────────────────────────────────────
  const [metaTemplates, setMetaTemplates] = useState([
    { type: 'Job Listing',     title: '{title} at {company} in {city} | {site_name}', desc: 'Apply for {title} at {company}. {job_type} job in {city}, {country}. Salary: {salary_range}. Apply today on {site_name}.' },
    { type: 'Job Category',    title: '{category} Jobs in UAE | {site_name}',         desc: 'Browse {job_count}+ {category} jobs in UAE and GCC. Find full-time, part-time and walk-in opportunities.' },
    { type: 'Company Profile', title: 'Jobs at {company} | {site_name}',             desc: 'View all open positions at {company}. Apply directly on {site_name}.' },
    { type: 'Location Page',   title: 'Jobs in {city}, UAE | {site_name}',           desc: 'Find jobs in {city}. Browse {job_count}+ vacancies across all industries. Updated daily.' },
    { type: 'Home Page',       title: 'UAE Careers — Find Jobs in UAE, Gulf & MENA', desc: 'Search thousands of jobs in UAE, Saudi Arabia, Qatar, Kuwait, Oman. Walk-in interviews, featured jobs and salary guides — updated daily.' },
    { type: 'Blog / Article',  title: '{title} | {site_name}',                       desc: '{excerpt}' },
  ]);

  // ── Content registry ────────────────────────────────────────────────────────
  const [contentTypes, setContentTypes] = useState<ContentType[]>(MOCK_CONTENT_TYPES);
  const [showRegWizard, setShowRegWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [newType_key,   setNewType_key]   = useState('');
  const [newType_label, setNewType_label] = useState('');
  const [newType_url,   setNewType_url]   = useState('');
  const [newType_schema, setNewType_schema] = useState('WebPage');

  const save = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500); }, 600);
  };

  const addRedirect = () => {
    if (!newSource) return;
    setRedirects(p => [{ id: Date.now(), source: newSource, destination: newDest, type: newType, hits: 0, status: 'active', created: new Date().toISOString().slice(0,10) }, ...p]);
    setNewSource(''); setNewDest('');
  };

  const addKeyword = () => {
    if (!newKeyword) return;
    setKeywords(p => [{ id: Date.now(), keyword: newKeyword, target: newKwTarget || '/', engine: 'google.ae', lang: 'en', position: null, change: 0 }, ...p]);
    setNewKeyword(''); setNewKwTarget('');
  };

  const registerType = () => {
    if (!newType_key || !newType_label) return;
    setContentTypes(p => [...p, { key: newType_key, label: newType_label, urlPattern: newType_url || `/${newType_key}/{slug}`, schema: newType_schema, sitemap: `sitemap-${newType_key}.xml`, status: 'active', records: 0, missingMeta: 0 }]);
    setShowRegWizard(false); setWizardStep(1); setNewType_key(''); setNewType_label(''); setNewType_url('');
  };

  const scoreColor = SEO_SCORE >= 75 ? 'text-emerald-600' : SEO_SCORE >= 50 ? 'text-amber-600' : 'text-red-600';
  const scoreBg    = SEO_SCORE >= 75 ? 'bg-emerald-50'    : SEO_SCORE >= 50 ? 'bg-amber-50'    : 'bg-red-50';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A3C6E]">SEO Command Centre</h1>
          <p className="text-xs text-gray-500 mt-0.5">Unified SEO management — all tools in one place</p>
        </div>
        {saved && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-2 rounded-lg font-medium">
            ✓ Settings saved
          </div>
        )}
      </div>

      {/* Tab bar — scrollable on mobile */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-1.5 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                tab === t.id ? 'bg-[#1A3C6E] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────────────────── TAB 1: DASHBOARD ─────────────────────────── */}
      {tab === 'dashboard' && (
        <div className="space-y-4">
          {/* Score + stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className={`col-span-2 lg:col-span-1 ${scoreBg} rounded-xl p-5 border border-white text-center`}>
              <p className="text-xs text-gray-500 font-medium mb-1">SEO Health Score</p>
              <p className={`text-5xl font-black ${scoreColor}`}>{SEO_SCORE}</p>
              <p className={`text-xs font-semibold mt-1 ${scoreColor}`}>{SEO_SCORE >= 75 ? 'Good' : SEO_SCORE >= 50 ? 'Needs Work' : 'Critical'}</p>
            </div>
            {[
              { label: 'Active Redirects', value: redirects.filter(r=>r.status==='active').length, color: 'text-[#1A3C6E]' },
              { label: '404 Errors (30d)', value: MOCK_404s.length, color: 'text-red-600' },
              { label: 'Pages in Sitemap', value: '5,305', color: 'text-emerald-600' },
              { label: 'Missing Meta Desc', value: '76', color: 'text-amber-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Discovery alert */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-amber-800 mb-2">⚠️ SEO Auto-Discovery Alert</p>
            <div className="space-y-1.5 text-sm text-amber-700">
              {[
                { pattern: '/salary-guide/...', urls: 47, hits: 234 },
                { pattern: '/tools/...',         urls: 12, hits: 89 },
              ].map(d => (
                <div key={d.pattern} className="flex items-center justify-between">
                  <span><code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">{d.pattern}</code> — {d.urls} URLs, {d.hits} hits this week</span>
                  <button onClick={() => { setTab('registry'); setShowRegWizard(true); }} className="text-xs font-semibold text-amber-800 underline">Configure →</button>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <Card title="SEO Checklist">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SEO_CHECKLIST.map((item, i) => (
                <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg text-sm ${item.ok ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  <span className="flex-shrink-0">{item.ok ? '✅' : '❌'}</span>
                  <span className={item.ok ? 'text-emerald-800' : 'text-red-800'}>{item.label}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick actions */}
          <Card title="Quick Actions">
            <div className="flex flex-wrap gap-3">
              {[
                { label: '🔄 Regenerate Sitemap', action: () => alert('Sitemap queued for regeneration') },
                { label: '⚡ Ping IndexNow',      action: () => alert('IndexNow pinged — Bing & Yandex notified') },
                { label: '🧹 Clear SEO Cache',    action: () => alert('SEO cache cleared') },
                { label: '🔍 Run SEO Audit',      action: () => { setTab('reports'); } },
              ].map(a => (
                <button key={a.label} onClick={a.action} className="rounded-lg border border-[#1A3C6E] text-[#1A3C6E] px-4 py-2 text-sm font-medium hover:bg-[#1A3C6E] hover:text-white transition-colors">
                  {a.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Content type health */}
          <Card title="Content Type Registry Health">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Type','Records','Missing Meta','Schema','Sitemap','Health'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contentTypes.map(ct => (
                    <tr key={ct.key} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-3 py-2.5 font-medium text-gray-800">{ct.label}</td>
                      <td className="px-3 py-2.5 text-gray-600">{ct.records.toLocaleString()}</td>
                      <td className="px-3 py-2.5">{ct.missingMeta > 0 ? <span className="text-amber-600 font-medium">{ct.missingMeta} ⚠️</span> : <span className="text-emerald-600">0 ✓</span>}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{ct.schema}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{ct.sitemap}</td>
                      <td className="px-3 py-2.5">{ct.status === 'active' ? (ct.missingMeta > 0 ? <StatusBadge label="🟡 Good" color="amber" /> : <StatusBadge label="✅ Excellent" color="green" />) : <StatusBadge label="🔴 Needs Setup" color="red" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ─────────────────────────── TAB 2: GLOBAL SETTINGS ──────────────────── */}
      {tab === 'global' && (
        <div className="space-y-4">
          <Card title="Site Identity">
            <Field label="Website Name"><input className={inp} value={siteName} onChange={e => setSiteName(e.target.value)} /></Field>
            <Field label="Tagline / Description"><input className={inp} value={tagline} onChange={e => setTagline(e.target.value)} /></Field>
            <Field label="Entity Type">
              <select className={inp} value={orgType} onChange={e => setOrgType(e.target.value)}>
                {['Organization','Person','LocalBusiness'].map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Phone (UAE format)"><input className={inp} value={orgPhone} onChange={e => setOrgPhone(e.target.value)} placeholder="+971 4 123 4567" /></Field>
            <Field label="Address (UAE format)"><input className={inp} value={orgAddress} onChange={e => setOrgAddress(e.target.value)} placeholder="Building, Street, Area, Emirate, UAE" /></Field>
            <Field label="Primary Language">
              <select className={inp} value={primaryLang} onChange={e => setPrimaryLang(e.target.value)}>
                {['English','Arabic','Both'].map(l => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Salary Currency">
              <select className={inp} value={currency} onChange={e => setCurrency(e.target.value)}>
                {['AED','SAR','QAR','KWD','BHD','OMR','USD'].map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </Card>

          <Card title="Meta Title & Description Templates">
            <p className="text-xs text-gray-500 mb-4">Templates use variables like <code className="bg-gray-100 px-1 rounded">{'{title}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{company}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{city}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{site_name}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{job_count}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{salary_range}'}</code></p>
            <div className="space-y-4">
              {metaTemplates.map((mt, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-semibold text-[#1A3C6E]">{mt.type}</p>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>SEO Title</span>
                      <span className={mt.title.length > 60 ? 'text-red-500 font-medium' : 'text-emerald-600'}>{mt.title.length}/60</span>
                    </div>
                    <input className={inp} value={mt.title}
                      onChange={e => setMetaTemplates(p => p.map((t,j) => j===i ? {...t, title: e.target.value} : t))} />
                    <div className="h-1.5 rounded-full bg-gray-100 mt-1.5">
                      <div className={`h-1.5 rounded-full transition-all ${mt.title.length > 60 ? 'bg-red-400' : 'bg-emerald-400'}`} style={{ width: `${Math.min(100, (mt.title.length/60)*100)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Meta Description</span>
                      <span className={mt.desc.length > 160 ? 'text-red-500 font-medium' : 'text-emerald-600'}>{mt.desc.length}/160</span>
                    </div>
                    <textarea className={`${inp} min-h-[60px] resize-y`} value={mt.desc}
                      onChange={e => setMetaTemplates(p => p.map((t,j) => j===i ? {...t, desc: e.target.value} : t))} />
                  </div>
                  {/* SERP Preview */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1">Google SERP Preview</p>
                    <p className="text-[#1a0dab] text-sm font-medium leading-tight truncate">{mt.title.replace(/\{[\w_]+\}/g, '…').slice(0,60)}</p>
                    <p className="text-[#006621] text-xs">https://uaecareer.ae/jobs/example-job</p>
                    <p className="text-gray-600 text-xs leading-relaxed mt-0.5 line-clamp-2">{mt.desc.replace(/\{[\w_]+\}/g, '…').slice(0,160)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Indexing Defaults">
            <Field label="Default Robots">
              <select className={inp} value={defaultRobots} onChange={e => setDefaultRobots(e.target.value)}>
                {['index,follow','noindex,follow','index,nofollow','noindex,nofollow'].map(r => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Noindex expired jobs"><Toggle value={noindexExpired} onChange={setNoindexExpired} /></Field>
            <Field label="Noindex search result pages"><Toggle value={noindexSearch} onChange={setNoindexSearch} /></Field>
            <Field label="Force HTTPS in canonical URLs"><Toggle value={forceHTTPS} onChange={setForceHTTPS} /></Field>
            <Field label="Remove trailing slash from canonical"><Toggle value={trailingSlash} onChange={setTrailingSlash} /></Field>
          </Card>

          <SaveBtn onClick={save} saving={saving} />
        </div>
      )}

      {/* ─────────────────────────── TAB 3: ON-PAGE MANAGER ──────────────────── */}
      {tab === 'onpage' && (
        <div className="space-y-4">
          <Card title="On-Page SEO — All Content Types" action={
            <select className="rounded-lg border border-gray-200 text-xs px-3 py-1.5 focus:outline-none">
              {contentTypes.filter(ct=>ct.status==='active').map(ct => <option key={ct.key}>{ct.label}</option>)}
            </select>
          }>
            <p className="text-xs text-gray-500 mb-4">Content types are driven by the <button onClick={()=>setTab('registry')} className="text-[#FF6B35] underline font-medium">Content Type Registry (Tab 13)</button>. New types appear here automatically when registered.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Title','SEO Title','Meta Desc','Robots','Schema','OG Image','Status','Actions'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { title:'Senior PHP Developer Dubai', seotitle:'Senior PHP Developer Dubai at TechCorp | UAE Careers', seolen:52, desclen:148, robots:'index', schema:'✅', og:'✅', status:'approved' },
                    { title:'Marketing Manager Riyadh',   seotitle:'Marketing Manager Riyadh at Gulf Media | UAE Careers', seolen:55, desclen:0,   robots:'index', schema:'✅', og:'❌', status:'pending' },
                    { title:'Nurse ICU — Abu Dhabi',      seotitle:'',                                                      seolen:0,  desclen:0,   robots:'index', schema:'⚠️', og:'❌', status:'pending' },
                    { title:'Civil Engineer Aldar',       seotitle:'Civil Engineer at Aldar Properties | UAE Careers',      seolen:48, desclen:155, robots:'index', schema:'✅', og:'✅', status:'approved' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-blue-50/30">
                      <td className="px-3 py-2.5 font-medium text-gray-800 max-w-[140px] truncate text-xs">{row.title}</td>
                      <td className="px-3 py-2.5 text-xs max-w-[160px]">
                        {row.seotitle ? <><span className="truncate block">{row.seotitle.slice(0,30)}…</span><span className={`text-[10px] font-medium ${row.seolen > 60 ? 'text-red-500' : 'text-emerald-600'}`}>{row.seolen}/60</span></> : <span className="text-red-400 text-[10px]">Missing ❌</span>}
                      </td>
                      <td className="px-3 py-2.5 text-xs">{row.desclen > 0 ? <span className={`text-[10px] font-medium ${row.desclen > 160 ? 'text-red-500' : 'text-emerald-600'}`}>{row.desclen}/160</span> : <span className="text-red-400 text-[10px]">Missing ❌</span>}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{row.robots}</td>
                      <td className="px-3 py-2.5 text-xs">{row.schema}</td>
                      <td className="px-3 py-2.5 text-xs">{row.og}</td>
                      <td className="px-3 py-2.5"><StatusBadge label={row.status} color={row.status==='approved'?'green':'amber'} /></td>
                      <td className="px-3 py-2.5"><button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">Edit</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="rounded px-3 py-1.5 text-xs font-medium bg-[#1A3C6E] text-white hover:bg-[#0d2444]">Bulk Apply Template</button>
              <button className="rounded px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50">Export CSV</button>
              <button className="rounded px-3 py-1.5 text-xs font-medium bg-amber-100 text-amber-700 hover:bg-amber-200">Show Missing Meta (76)</button>
            </div>
          </Card>
        </div>
      )}

      {/* ─────────────────────────── TAB 4: SCHEMA ───────────────────────────── */}
      {tab === 'schema' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-emerald-800 mb-1">⚡ Prerequisites for Schema / Structured Data</p>
            <ul className="text-xs text-emerald-700 space-y-1 mt-2">
              <li>1. <strong>JobPosting schema</strong> requires every job to have: title, description, datePosted, validThrough, hiringOrganization, jobLocation — ensure these fields are filled in the Jobs module.</li>
              <li>2. <strong>Validate Schema</strong> button calls Google's Rich Results Test API — requires the site to be live and publicly accessible (not localhost).</li>
              <li>3. <strong>JSON-LD preview</strong> works offline — use it to check structure before deploying.</li>
              <li>4. After enabling a new schema type, trigger a <button onClick={()=>setTab('sitemap')} className="underline font-semibold">Sitemap Regeneration</button> so Google re-crawls updated pages.</li>
            </ul>
          </div>
          <Card title="Schema / Structured Data — Global Toggles">
            <div className="space-y-3">
              {[
                { key: 'website',      label: 'WebSite Schema',        hint: 'Enables Sitelinks Search Box in Google' },
                { key: 'breadcrumb',   label: 'BreadcrumbList',        hint: 'Auto-generated on all pages from URL hierarchy' },
                { key: 'jobPosting',   label: 'JobPosting Schema',     hint: 'Google for Jobs — highest impact' },
                { key: 'organization', label: 'Organization Schema',   hint: 'For the site + company profiles' },
                { key: 'faqPage',      label: 'FAQPage Schema',        hint: 'For FAQ sections on category/location pages' },
                { key: 'newsArticle',  label: 'NewsArticle Schema',    hint: 'For blog/news content' },
              ].map(s => (
                <div key={s.key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{s.label}</p>
                    <p className="text-xs text-gray-400">{s.hint}</p>
                  </div>
                  <Toggle value={schemaToggles[s.key as keyof typeof schemaToggles]} onChange={v => setSchemaToggles(p => ({...p, [s.key]: v}))} />
                </div>
              ))}
            </div>
          </Card>

          <Card title="JobPosting Schema — Field Mappings" action={<StatusBadge label="Google for Jobs ✓" color="green" />}>
            <p className="text-xs text-gray-500 mb-4">These mappings connect your database fields to the Google JobPosting schema. Auto-generated on every job detail page.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Schema Property</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Mapped DB Field</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['title',                   'jobs.title',              '✅'],
                    ['description',             'jobs.description',        '✅'],
                    ['datePosted',              'jobs.created_at',         '✅'],
                    ['validThrough',            'jobs.expiry_date',        '⚠️ Optional'],
                    ['employmentType',          'jobs.job_type',           '✅'],
                    ['hiringOrganization.name', 'companies.name',          '✅'],
                    ['jobLocation.addressLocality', 'jobs.location_city',  '✅'],
                    ['jobLocation.addressCountry',  'jobs.country_code',   '✅'],
                    ['baseSalary.minValue',     'jobs.salary_min',         '✅'],
                    ['baseSalary.maxValue',     'jobs.salary_max',         '✅'],
                    ['baseSalary.currency',     'jobs.salary_currency',    '✅'],
                    ['directApply',             'computed: apply_method', '✅'],
                  ].map(([prop, field, status]) => (
                    <tr key={prop} className="border-b border-gray-50">
                      <td className="px-3 py-2 font-mono text-xs text-gray-700">{prop}</td>
                      <td className="px-3 py-2 font-mono text-xs text-[#1A3C6E]">{field}</td>
                      <td className="px-3 py-2 text-xs">{status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={()=>alert('Schema is valid — all required fields present')} className="rounded px-3 py-1.5 text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200">✓ Validate Schema</button>
              <button onClick={()=>alert('{"@context":"https://schema.org","@type":"JobPosting","title":"Senior PHP Developer","employmentType":"FULL_TIME",...}')} className="rounded px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50">Preview JSON-LD</button>
            </div>
          </Card>

          <SaveBtn onClick={save} saving={saving} />
        </div>
      )}

      {/* ─────────────────────────── TAB 5: TECHNICAL SEO ────────────────────── */}
      {tab === 'technical' && (
        <div className="space-y-4">
          <Card title="Robots.txt Editor">
            <div className="mb-2 flex gap-2">
              <button onClick={()=>alert('Robots.txt saved')} className="rounded px-3 py-1.5 text-xs font-medium bg-[#1A3C6E] text-white hover:bg-[#0d2444]">Save</button>
              <button className="rounded px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50">Reset to Default</button>
              <button onClick={()=>window.open('https://www.google.com/webmasters/tools/robots-testing-tool','_blank')} className="rounded px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50">Test in Google ↗</button>
            </div>
            <textarea
              value={robotsTxt}
              onChange={e => setRobotsTxt(e.target.value)}
              className="w-full font-mono text-xs bg-gray-900 text-green-400 rounded-lg p-4 min-h-[200px] resize-y focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
            />
            {robotsTxt.includes('Disallow: /jobs/') && (
              <p className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">⚠️ Warning: You are blocking <code>/jobs/</code> — this will prevent Google from crawling job listings!</p>
            )}
          </Card>

          <Card title="IndexNow — Instant Indexing (Bing + Yandex)">
            <Field label="API Key" hint="Share this key as a file at yourdomain.com/{key}.txt">
              <div className="flex gap-2">
                <input className={inp} value={indexnowKey} onChange={e => setIndexnowKey(e.target.value)} />
                <button onClick={()=>setIndexnowKey(Math.random().toString(36).substring(2,18))} className="rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 whitespace-nowrap">Generate</button>
              </div>
            </Field>
            <Field label="Auto-ping on job publish"><Toggle value={autoIndexNow} onChange={setAutoIndexNow} /></Field>
            <Field label="Manual ping" hint="Enter URL to submit immediately">
              <div className="flex gap-2">
                <input className={inp} placeholder="https://uaecareer.ae/jobs/example" />
                <button onClick={()=>alert('URL submitted to IndexNow — Bing & Yandex notified')} className="rounded-lg bg-[#FF6B35] text-white px-3 py-2 text-xs font-semibold hover:bg-[#e55a24] whitespace-nowrap">Ping Now</button>
              </div>
            </Field>
          </Card>

          <Card title="Google Indexing API (JobPosting)">
            <Field label="Service Account JSON" hint="For real-time job indexing — Google recommends this for job boards">
              <div className="flex items-center gap-2">
                <Toggle value={googleIndexingAPI} onChange={setGoogleIndexingAPI} />
                <span className="text-sm text-gray-500">{googleIndexingAPI ? 'Enabled — upload Service Account JSON' : 'Disabled'}</span>
              </div>
            </Field>
            {googleIndexingAPI && (
              <>
                <Field label="Auto-notify on job publish"><Toggle value={true} onChange={()=>{}} /></Field>
                <Field label="Auto-notify on job expiry/deletion" hint="Sends REMOVE notification to Google"><Toggle value={true} onChange={()=>{}} /></Field>
                <button className="rounded-lg border-2 border-dashed border-gray-300 w-full py-6 text-sm text-gray-500 hover:bg-gray-50 mt-2">📁 Upload service-account.json</button>
              </>
            )}
          </Card>

          <Card title="LLMs.txt — AI Visibility (ChatGPT, Claude, Perplexity)">
            <p className="text-xs text-gray-500 mb-3">Helps AI systems understand and correctly cite your website. Served at <code className="bg-gray-100 px-1 rounded">yourdomain.com/llms.txt</code></p>
            <textarea
              value={llmsTxt}
              onChange={e => setLlmsTxt(e.target.value)}
              className="w-full font-mono text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 min-h-[160px] resize-y focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
            />
          </Card>

          <SaveBtn onClick={save} saving={saving} />
        </div>
      )}

      {/* ─────────────────────────── TAB 6: SITEMAP ──────────────────────────── */}
      {tab === 'sitemap' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-amber-800 mb-1">⚡ Prerequisites for Sitemap Submission</p>
            <ul className="text-xs text-amber-700 space-y-1 mt-2">
              <li>1. <strong>Verify domain in Google Search Console</strong> (Webmaster Tools tab) before using "Submit All" — unverified domains are silently ignored by GSC.</li>
              <li>2. <strong>Bing Webmaster</strong> requires its own verification code (separate from GSC) before Bing will accept submissions.</li>
              <li>3. <strong>Regenerate All</strong> runs locally and works without any external setup — do this first whenever you add new content.</li>
              <li>4. Sitemap URLs are publicly accessible at <code className="bg-amber-100 px-1 rounded">https://uaecareer.ae/sitemap.xml</code> — no auth required.</li>
            </ul>
          </div>
          <Card title="Sitemap Manager" action={
            <div className="flex gap-2">
              <button onClick={()=>alert('All sitemaps queued for regeneration')} className="rounded-lg bg-[#1A3C6E] text-white px-3 py-1.5 text-xs font-medium hover:bg-[#0d2444]">🔄 Regenerate All</button>
              <button onClick={()=>alert('Sitemaps submitted to Google Search Console, Bing, Yandex')} className="rounded-lg border border-gray-300 text-gray-600 px-3 py-1.5 text-xs hover:bg-gray-50">Submit All</button>
            </div>
          }>
            <p className="text-xs text-gray-500 mb-4">Sitemap files are <span className="font-medium">auto-created</span> for each registered content type. New types in the <button onClick={()=>setTab('registry')} className="text-[#FF6B35] underline">Content Registry</button> automatically get their own sitemap.</p>
            <div className="space-y-3">
              {sitemapConfig.map((sm, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${sm.enabled ? 'bg-emerald-400' : 'bg-gray-300'}`} />
                      <code className="text-sm font-semibold text-[#1A3C6E]">{sm.file}</code>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Last: {sm.lastGen}</span>
                      <button onClick={()=>window.open(`https://uaecareer.ae/${sm.file}`,'_blank')} className="text-[#FF6B35] hover:underline">Preview ↗</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Priority</label>
                      <select className={inp} defaultValue={sm.priority}>
                        {['0.1','0.2','0.3','0.4','0.5','0.6','0.7','0.8','0.9','1.0'].map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Frequency</label>
                      <select className={inp} defaultValue={sm.freq}>
                        {['always','hourly','daily','weekly','monthly','yearly','never'].map(f => <option key={f}>{f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Enabled</label>
                      <div className="pt-1.5"><Toggle value={sm.enabled} onChange={()=>{}} /></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ─────────────────────────── TAB 7: REDIRECTS & 404 ─────────────────── */}
      {tab === 'redirects' && (
        <div className="space-y-4">
          <Card title="Add Redirect">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input className={inp} placeholder="/old-url" value={newSource} onChange={e => setNewSource(e.target.value)} />
              <input className={inp} placeholder="/new-url" value={newDest}   onChange={e => setNewDest(e.target.value)} />
              <select className={inp} value={newType} onChange={e => setNewType(Number(e.target.value) as 301|302|410)}>
                <option value={301}>301 — Permanent</option>
                <option value={302}>302 — Temporary</option>
                <option value={410}>410 — Gone</option>
              </select>
              <button onClick={addRedirect} className="rounded-lg bg-[#FF6B35] text-white px-4 py-2 text-sm font-semibold hover:bg-[#e55a24]">Add Redirect</button>
            </div>
          </Card>

          <Card title={`Redirect Manager (${redirects.length})`} action={<button className="text-xs text-gray-500 hover:text-gray-700">Export CSV</button>}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Source','Destination','Type','Hits','Status','Created','Actions'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {redirects.map((r) => (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-3 py-2.5 font-mono text-xs text-gray-700 max-w-[160px] truncate">{r.source}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-gray-500 max-w-[160px] truncate">{r.destination || '—'}</td>
                      <td className="px-3 py-2.5"><StatusBadge label={`${r.type}`} color={r.type===301?'green':r.type===302?'amber':'gray'} /></td>
                      <td className="px-3 py-2.5 text-gray-600 text-xs">{r.hits}</td>
                      <td className="px-3 py-2.5"><StatusBadge label={r.status} color={r.status==='active'?'green':'gray'} /></td>
                      <td className="px-3 py-2.5 text-gray-500 text-xs">{r.created}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1">
                          <button onClick={()=>setRedirects(p=>p.map(x=>x.id===r.id?{...x,status:x.status==='active'?'inactive':'active'}:x))} className="rounded px-2 py-1 text-xs bg-gray-100 text-gray-600 hover:bg-gray-200">{r.status==='active'?'Pause':'Enable'}</button>
                          <button onClick={()=>setRedirects(p=>p.filter(x=>x.id!==r.id))} className="rounded px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200">Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="404 Error Monitor">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['404 URL','Referrer','Hits','Last Seen','Action'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_404s.map((e, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-red-50/30">
                      <td className="px-3 py-2.5 font-mono text-xs text-red-700">{e.url}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{e.referrer}</td>
                      <td className="px-3 py-2.5 font-semibold text-red-600 text-xs">{e.hits}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{e.last_seen}</td>
                      <td className="px-3 py-2.5">
                        <button onClick={()=>{ setNewSource(e.url); setTab('redirects'); }} className="rounded px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200">Create Redirect</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ─────────────────────────── TAB 8: SOCIAL / OG ──────────────────────── */}
      {tab === 'social' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-purple-800 mb-1">⚡ Prerequisites for Social / OG Tags</p>
            <ul className="text-xs text-purple-700 space-y-1 mt-2">
              <li>1. <strong>OG Image must be publicly hosted</strong> — local file paths and localhost URLs will not work for social sharing. Upload your image to a CDN or public URL first.</li>
              <li>2. <strong>Facebook App ID</strong> is optional but unlocks Facebook Insights for your shared links. Create one at developers.facebook.com.</li>
              <li>3. <strong>Twitter/X card preview</strong> only shows real data after Twitter crawls the page. Use <a href="https://cards-dev.twitter.com/validator" target="_blank" rel="noopener noreferrer" className="underline">Twitter Card Validator</a> to force a crawl.</li>
              <li>4. Changes here take effect globally — per-page overrides are set in the On-Page Manager.</li>
            </ul>
          </div>
          <Card title="Global Social Defaults">
            <Field label="Default OG Image" hint="1200×630px — used when no specific OG image is set (PNG/JPG)">
              <input className={inp} value={defaultOGImage} onChange={e => setDefaultOGImage(e.target.value)} placeholder="https://uaecareer.ae/og-default.jpg" />
              {defaultOGImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={defaultOGImage} alt="OG preview" className="mt-2 rounded-lg h-20 object-cover" onError={e=>{(e.target as HTMLImageElement).style.display='none'}} />
              )}
            </Field>
            <Field label="Twitter/X Card Type">
              <select className={inp}><option>summary_large_image</option><option>summary</option></select>
            </Field>
            <Field label="Twitter/X Handle"><input className={inp} value={twitterHandle} onChange={e => setTwitterHandle(e.target.value)} placeholder="@UAECareers" /></Field>
            <Field label="Facebook App ID"><input className={inp} value={fbAppId} onChange={e => setFbAppId(e.target.value)} placeholder="123456789" /></Field>
            <Field label="LinkedIn Page URL"><input className={inp} value={linkedInUrl} onChange={e => setLinkedInUrl(e.target.value)} placeholder="https://linkedin.com/company/uae-careers" /></Field>
            <Field label="WhatsApp Business Number"><input className={inp} value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} placeholder="+971 55 123 4567" /></Field>
          </Card>

          <Card title="Social Preview Tool">
            <p className="text-xs text-gray-500 mb-3">Enter any page URL to preview how it looks when shared on social media.</p>
            <div className="flex gap-2 mb-4">
              <input className={inp} placeholder="https://uaecareer.ae/jobs/php-developer-dubai" />
              <button className="rounded-lg bg-[#1A3C6E] text-white px-4 py-2 text-sm font-semibold hover:bg-[#0d2444] whitespace-nowrap">Preview</button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Facebook / LinkedIn Preview</p>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden max-w-sm">
                <div className="h-32 bg-gradient-to-r from-[#1A3C6E] to-[#FF6B35] flex items-center justify-center text-white text-sm">OG Image (1200×630)</div>
                <div className="p-3">
                  <p className="text-xs text-gray-500">UAECAREER.AE</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">Senior PHP Developer at TechCorp | UAE Careers</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">Apply for Senior PHP Developer at TechCorp. Full-time job in Dubai. Salary: AED 15,000–25,000/month.</p>
                </div>
              </div>
            </div>
          </Card>

          <SaveBtn onClick={save} saving={saving} />
        </div>
      )}

      {/* ─────────────────────────── TAB 9: WEBMASTER TOOLS ─────────────────── */}
      {tab === 'webmaster' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-blue-800 mb-1">⚡ Setup Order — Complete in This Sequence</p>
            <ul className="text-xs text-blue-700 space-y-1 mt-2">
              <li>1. <strong>Google Search Console:</strong> Add property at search.google.com/search-console → copy the HTML meta tag value → paste below → deploy → click Verify in GSC.</li>
              <li>2. <strong>Bing Webmaster:</strong> Sign in at bing.com/webmasters → Add site → copy msvalidate.01 value → paste below → deploy → verify.</li>
              <li>3. <strong>GTM first, then GA4:</strong> If using Google Tag Manager, add GA4 through GTM — do NOT enter both GTM and GA4 IDs here simultaneously or you will double-count pageviews.</li>
              <li>4. <strong>IndexNow API key</strong> (Technical tab) only works after GSC verification is complete.</li>
            </ul>
          </div>
          <Card title="Search Engine Verification">
            <Field label="Google Search Console" hint="Paste HTML meta tag value only (not the full tag)">
              <input className={inp} value={gscCode} onChange={e => setGscCode(e.target.value)} placeholder="google-site-verification=xxxxx" />
            </Field>
            <Field label="Bing Webmaster Tools" hint="Important: Bing has high UAE market share via Edge/Microsoft">
              <input className={inp} value={bingCode} onChange={e => setBingCode(e.target.value)} placeholder="msvalidate.01 value" />
            </Field>
            <Field label="Yandex Webmaster" hint="Relevant for Russian expat community in UAE">
              <input className={inp} value={yandexCode} onChange={e => setYandexCode(e.target.value)} placeholder="yandex-verification value" />
            </Field>
          </Card>

          <Card title="Analytics Integrations">
            <Field label="Google Tag Manager Container ID">
              <input className={inp} value={gtmId} onChange={e => setGtmId(e.target.value)} placeholder="GTM-XXXXXXX" />
            </Field>
            <Field label="Google Analytics 4 Measurement ID">
              <input className={inp} value={ga4Id} onChange={e => setGa4Id(e.target.value)} placeholder="G-XXXXXXXXXX" />
            </Field>
            <Field label="Microsoft Clarity Project ID">
              <input className={inp} placeholder="project-id" />
            </Field>
            <Field label="Hotjar Site ID">
              <input className={inp} placeholder="1234567" />
            </Field>
          </Card>

          <Card title="API Keys" action={<span className="text-xs text-gray-400">All stored encrypted</span>}>
            {['Google Search Console API','Google Indexing API','Bing Webmaster API','GA4 Data API','DataForSEO (Rank Tracker)'].map(k => (
              <div key={k} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-700">{k}</p>
                  <p className="text-xs font-mono text-gray-400">●●●●●●●●●●●● not connected</p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded px-3 py-1 text-xs border border-gray-200 text-gray-600 hover:bg-gray-50">Connect</button>
                  <button className="rounded px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200">Test</button>
                </div>
              </div>
            ))}
          </Card>

          <SaveBtn onClick={save} saving={saving} />
        </div>
      )}

      {/* ─────────────────────────── TAB 10: MULTILINGUAL ───────────────────── */}
      {tab === 'multilingual' && (
        <div className="space-y-4">
          <Card title="Language & Region Configuration">
            <Field label="Primary Language">
              <select className={inp} value={primaryLang} onChange={e => setPrimaryLang(e.target.value)}>
                {['English','Arabic','Both'].map(l => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Primary Locale" hint="Used in HTML lang attribute and hreflang tags">
              <select className={inp} value={primaryLocale} onChange={e => setPrimaryLocale(e.target.value)}>
                {['en-ae','ar-ae','en-gb','en-us','ar-sa','ar-qa','ar-kw'].map(l => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Enable Hreflang Tags"><Toggle value={enableHreflang} onChange={setEnableHreflang} /></Field>
          </Card>

          <Card title="Hreflang Rules — GCC Targeting">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Language','Region','Full Tag','URL Pattern','Status'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { lang:'en', region:'ae', tag:'en-ae', pattern:'/jobs/{slug}',    active: true  },
                    { lang:'ar', region:'ae', tag:'ar-ae', pattern:'/ar/jobs/{slug}', active: false },
                    { lang:'en', region:'gb', tag:'en-gb', pattern:'/jobs/{slug}',    active: false },
                    { lang:'',   region:'',   tag:'x-default', pattern:'/jobs/{slug}', active: true },
                    { lang:'ar', region:'sa', tag:'ar-sa', pattern:'/ar/jobs/{slug}', active: false },
                    { lang:'ar', region:'qa', tag:'ar-qa', pattern:'/ar/jobs/{slug}', active: false },
                  ].map((r, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="px-3 py-2.5 text-gray-600 text-xs">{r.lang || '—'}</td>
                      <td className="px-3 py-2.5 text-gray-600 text-xs">{r.region || '—'}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-[#1A3C6E] font-semibold">{r.tag}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-gray-500">{r.pattern}</td>
                      <td className="px-3 py-2.5"><Toggle value={r.active} onChange={()=>{}} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Arabic SEO Settings">
            <Field label="Arabic Slug Style">
              <select className={inp} value={arabicSlugStyle} onChange={e => setArabicSlugStyle(e.target.value)}>
                <option value="transliterated">Transliterated — /wazaif-dubai/ (recommended for SEO)</option>
                <option value="native">Native Arabic — /وظائف-دبي/ (technically valid)</option>
              </select>
            </Field>
            <Field label="Arabic Title Char Limit" hint="Arabic chars display wider — ~40 chars ≈ 60 English pixels">
              <input className={inp} type="number" defaultValue={40} />
            </Field>
          </Card>

          <Card title="Voice Search — MENA Optimisation">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <p className="text-sm font-semibold text-blue-800 mb-2">💡 50%+ of UAE searches are voice-based in 2025</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Add FAQ sections to category pages and enable FAQPage schema (Tab 4)</li>
                <li>• Target question-based queries: "What jobs are available in Dubai?"</li>
                <li>• Arabic voice: "وين أقدر أشوف وظائف في الإمارات؟"</li>
                <li>• Use the long-tail keyword field in On-Page Editor for conversational keywords</li>
              </ul>
            </div>
          </Card>

          <SaveBtn onClick={save} saving={saving} />
        </div>
      )}

      {/* ─────────────────────────── TAB 11: KEYWORD TRACKER ────────────────── */}
      {tab === 'keywords' && (
        <div className="space-y-4">
          {/* Prerequisite notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-blue-800 mb-1">⚡ Prerequisites for live ranking data</p>
            <ul className="text-xs text-blue-700 space-y-1 mt-2">
              <li>1. Connect <strong>Google Search Console</strong> in <button onClick={()=>setTab('webmaster')} className="underline font-semibold">Webmaster Tools →</button> to pull real impressions + position data automatically.</li>
              <li>2. Or enter a <strong>DataForSEO / SERP API key</strong> in Webmaster Tools → API Keys for live SERP position checking.</li>
              <li>3. Without API: use <strong>Manual Position Entry</strong> below — add keywords and type their position manually each week.</li>
            </ul>
          </div>
          <Card title="Add Keywords">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input className={inp} placeholder="e.g. jobs in Dubai" value={newKeyword} onChange={e => setNewKeyword(e.target.value)} />
              <input className={inp} placeholder="Target URL e.g. /jobs?city=dubai" value={newKwTarget} onChange={e => setNewKwTarget(e.target.value)} />
              <button onClick={addKeyword} className="rounded-lg bg-[#FF6B35] text-white px-4 py-2 text-sm font-semibold hover:bg-[#e55a24]">Track Keyword</button>
            </div>
          </Card>

          <Card title={`Tracked Keywords (${keywords.length})`} action={
            <div className="flex gap-2">
              <select className="rounded border border-gray-200 text-xs px-2 py-1"><option>All Languages</option><option>English</option><option>Arabic</option></select>
              <button className="text-xs text-gray-500 hover:text-gray-700">Export CSV</button>
            </div>
          }>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Keyword','Target URL','Engine','Lang','Position','Change','Actions'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {keywords.map((kw) => (
                    <tr key={kw.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-3 py-2.5 font-medium text-gray-800 text-sm">{kw.keyword}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-gray-500">{kw.target}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{kw.engine}</td>
                      <td className="px-3 py-2.5"><StatusBadge label={kw.lang} color={kw.lang==='ar'?'amber':'blue'} /></td>
                      <td className="px-3 py-2.5">
                        {kw.position ? <span className="font-bold text-[#1A3C6E]">#{kw.position}</span> : <span className="text-gray-400 text-xs">—</span>}
                      </td>
                      <td className="px-3 py-2.5">
                        {kw.change > 0 ? <span className="text-emerald-600 font-semibold text-sm">↑ +{kw.change}</span> :
                         kw.change < 0 ? <span className="text-red-500 font-semibold text-sm">↓ {kw.change}</span> :
                         <span className="text-gray-400 text-sm">—</span>}
                      </td>
                      <td className="px-3 py-2.5">
                        <button onClick={()=>setKeywords(p=>p.filter(x=>x.id!==kw.id))} className="rounded px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ─────────────────────────── TAB 12: REPORTS ─────────────────────────── */}
      {tab === 'reports' && (
        <div className="space-y-4">
          <Card title="SEO Audit Report" action={
            <button onClick={()=>alert('SEO audit started — scanning all pages…')} className="rounded-lg bg-[#FF6B35] text-white px-4 py-2 text-sm font-semibold hover:bg-[#e55a24]">🔍 Run Full Audit</button>
          }>
            <div className="space-y-2">
              {([
                { severity: 'critical', count: 76,  label: 'Pages with missing meta descriptions',   goTab: 'onpage' as Tab,    goLabel: 'Fix in On-Page Manager' },
                { severity: 'critical', count: 4,   label: 'Pages with duplicate meta titles',        goTab: 'onpage' as Tab,    goLabel: 'Fix in On-Page Manager' },
                { severity: 'warning',  count: 23,  label: 'Job listings with salary schema missing', goTab: 'schema' as Tab,    goLabel: 'Fix in Schema Manager'  },
                { severity: 'warning',  count: 5,   label: 'Broken internal links detected',          goTab: 'technical' as Tab, goLabel: 'View in Technical SEO'  },
                { severity: 'warning',  count: 12,  label: 'Pages with thin content (< 300 words)',   goTab: 'onpage' as Tab,    goLabel: 'View in On-Page Manager'},
                { severity: 'info',     count: 34,  label: 'Category pages missing H2 subheadings',  goTab: 'onpage' as Tab,    goLabel: 'View in On-Page Manager'},
                { severity: 'info',     count: 1,   label: 'Redirect chain detected (A→B→C)',         goTab: 'redirects' as Tab, goLabel: 'Fix in Redirects'       },
                { severity: 'info',     count: 0,   label: 'Hreflang not configured (en-ae / ar-ae)', goTab: 'multilingual' as Tab, goLabel: 'Configure Hreflang'  },
              ] as { severity:string; count:number; label:string; goTab:Tab; goLabel:string }[]).map((issue, i) => (
                <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-lg border ${issue.severity==='critical'?'bg-red-50 border-red-200':issue.severity==='warning'?'bg-amber-50 border-amber-200':'bg-blue-50 border-blue-100'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{issue.severity==='critical'?'❌':issue.severity==='warning'?'⚠️':'ℹ️'}</span>
                    <div>
                      <p className={`text-sm font-semibold ${issue.severity==='critical'?'text-red-800':issue.severity==='warning'?'text-amber-800':'text-blue-800'}`}>{issue.count > 0 ? `${issue.count} issues` : 'Not configured'} — {issue.label}</p>
                      <p className="text-xs text-gray-500 capitalize">{issue.severity} · Click to go to the right section</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setTab(issue.goTab)}
                    className={`rounded px-3 py-1 text-xs font-medium whitespace-nowrap ${issue.severity==='critical'?'bg-red-100 text-red-700 hover:bg-red-200':issue.severity==='warning'?'bg-amber-100 text-amber-700 hover:bg-amber-200':'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                  >
                    {issue.goLabel} →
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button className="rounded border border-gray-300 text-gray-600 px-4 py-2 text-xs hover:bg-gray-50">📄 Export PDF</button>
              <button className="rounded border border-gray-300 text-gray-600 px-4 py-2 text-xs hover:bg-gray-50">📊 Export CSV</button>
            </div>
          </Card>

          <Card title="Scheduled Email Reports">
            <Field label="Weekly report email(s)"><input className={inp} placeholder="admin@uaecareer.ae, seo@uaecareer.ae" /></Field>
            <Field label="Report frequency">
              <select className={inp}><option>Weekly (every Monday)</option><option>Monthly</option><option>Disabled</option></select>
            </Field>
            <Field label="Enable scheduled reports"><Toggle value={true} onChange={()=>{}} /></Field>
          </Card>

          <Card title="Activity Log — Last 10 SEO Changes">
            <div className="space-y-2">
              {[
                { action:'Meta title updated', item:'Senior PHP Developer Dubai', user:'Super Admin', time:'2026-06-13 14:32', old:'PHP Dev Dubai...', new_:'Senior PHP Developer Dubai at TechCorp | UAE Careers' },
                { action:'Redirect created', item:'/jobs/expired-nurse-2025 → /jobs/category/healthcare', user:'Super Admin', time:'2026-06-13 12:10', old:'', new_:'301 active' },
                { action:'Robots.txt saved', item:'robots.txt', user:'Super Admin', time:'2026-06-12 09:45', old:'', new_:'Updated Disallow rules' },
                { action:'Schema toggled', item:'FAQPage schema — enabled', user:'Super Admin', time:'2026-06-11 17:22', old:'false', new_:'true' },
              ].map((log, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-[#1A3C6E]/10 text-[#1A3C6E] flex items-center justify-center text-xs font-bold flex-shrink-0">A</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{log.action}</p>
                    <p className="text-xs text-gray-500 truncate">{log.item}</p>
                    {log.old && <p className="text-xs text-gray-400 mt-0.5"><span className="text-red-400 line-through">{log.old.slice(0,40)}</span> → <span className="text-emerald-600">{log.new_.slice(0,40)}</span></p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{log.time}</p>
                    <p className="text-xs text-gray-500">{log.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ─────────────────────────── TAB 13: CONTENT REGISTRY ───────────────── */}
      {tab === 'registry' && (
        <div className="space-y-4">
          {/* Discovery alert */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-amber-800 mb-1">⚡ Auto-Discovery Engine — 2 new URL patterns detected</p>
            <p className="text-xs text-amber-700 mb-3">These pages are receiving traffic but have no SEO configuration. They currently use global defaults.</p>
            {[{p:'/salary-guide/...',u:47,h:234},{p:'/tools/...',u:12,h:89}].map(d=>(
              <div key={d.p} className="flex items-center justify-between py-1.5">
                <span className="text-xs text-amber-800"><code className="bg-amber-100 px-1.5 py-0.5 rounded">{d.p}</code> — {d.u} URLs, {d.h} hits this week</span>
                <button onClick={()=>{ setShowRegWizard(true); setNewType_url(d.p.replace('...','slug')); }} className="text-xs bg-amber-700 text-white px-3 py-1 rounded hover:bg-amber-800">Configure →</button>
              </div>
            ))}
          </div>

          {/* Registry table */}
          <Card title={`Content Type Registry (${contentTypes.length} types)`} action={
            <button onClick={()=>setShowRegWizard(true)} className="rounded-lg bg-[#FF6B35] text-white px-4 py-2 text-sm font-semibold hover:bg-[#e55a24]">+ Register Type</button>
          }>
            <p className="text-xs text-gray-500 mb-4">This is the architectural brain of the SEO module. Every content type registered here gets automatic meta tags, schema, sitemap entry, and On-Page SEO coverage. <strong>Zero code changes required to the SEO module when new content types are added.</strong></p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Type Key','Label','URL Pattern','Schema','Sitemap','Records','Missing Meta','Status','Actions'].map(h=>(
                      <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contentTypes.map(ct=>(
                    <tr key={ct.key} className="border-b border-gray-50 hover:bg-blue-50/20">
                      <td className="px-3 py-2.5 font-mono text-xs text-[#1A3C6E] font-semibold">{ct.key}</td>
                      <td className="px-3 py-2.5 font-medium text-gray-800 text-sm">{ct.label}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-gray-500">{ct.urlPattern}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{ct.schema}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-gray-400">{ct.sitemap}</td>
                      <td className="px-3 py-2.5 text-gray-600 text-xs">{ct.records.toLocaleString()}</td>
                      <td className="px-3 py-2.5">{ct.missingMeta>0?<span className="text-amber-600 font-medium text-xs">{ct.missingMeta} ⚠️</span>:<span className="text-emerald-600 text-xs">0 ✓</span>}</td>
                      <td className="px-3 py-2.5"><StatusBadge label={ct.status} color={ct.status==='active'?'green':ct.status==='pending'?'amber':'gray'} /></td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1">
                          <button className="rounded px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200">Edit</button>
                          {ct.status!=='active'&&<button onClick={()=>setContentTypes(p=>p.map(x=>x.key===ct.key?{...x,status:'active'}:x))} className="rounded px-2 py-1 text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Activate</button>}
                          <button onClick={()=>setContentTypes(p=>p.filter(x=>x.key!==ct.key))} className="rounded px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200">Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Variable Registry */}
          <Card title="Variable Registry — Available in All Templates">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Variable','Content Types','Source','Example Output'].map(h=>(
                      <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['{site_name}','All types','Global setting','UAE Careers'],
                    ['{current_year}','All types','System','2026'],
                    ['{page_number}','All (paginated)','URL param','2'],
                    ['{title}','jobs, blog, pages','jobs.title / posts.title','Senior PHP Developer'],
                    ['{company}','jobs, companies','companies.name','TechCorp Dubai'],
                    ['{city}','jobs, companies, categories','cities.name','Dubai'],
                    ['{category}','jobs, categories','job_categories.name','Information Technology'],
                    ['{salary_range}','jobs','Computed: min–max + currency','AED 15,000–25,000'],
                    ['{job_type}','jobs','jobs.employment_type','Full-Time'],
                    ['{job_count}','categories, locations','COUNT(jobs)','1,240'],
                    ['{excerpt}','blog','posts.excerpt','Article summary…'],
                  ].map(([v,types,source,ex],i)=>(
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-3 py-2.5 font-mono text-xs text-[#FF6B35] font-semibold">{v}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{types}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-gray-400">{source}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-600 italic">{ex}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Developer registration API */}
          <Card title="Developer Registration API — SEO::register()">
            <p className="text-xs text-gray-500 mb-3">When your team builds a new feature, add this call once to the model/service file. The content type will appear in this registry automatically — no SEO module code changes needed.</p>
            <pre className="bg-gray-900 text-green-400 text-xs rounded-xl p-4 overflow-x-auto">{`// Place this call once in your new feature's service or model boot
// It is idempotent — safe to call on every app startup

SEO.register({
  type:         'courses',              // unique key
  label:        'Online Courses',
  url_pattern:  '/courses/{slug}',
  archive_url:  '/courses/',

  db_table:    'courses',
  pk_field:    'id',
  slug_field:  'slug',
  title_field: 'name',

  variables: {
    title:      'courses.name',
    instructor: 'instructors.full_name',
    category:   'course_categories.name',
    price:      'courses.price',
    city:       'Dubai',              // static value
  },

  default_title: '{title} Course by {instructor} | {site_name}',
  default_desc:  'Enroll in {title} — {category} course in {city}.',

  default_schema: 'Course',
  sitemap:        true,
  sitemap_file:   'sitemap-courses.xml',
  sitemap_priority: 0.7,
  sitemap_freq:   'weekly',

  // Auto-noindex when these conditions are met:
  noindex_when: { published: false, status: 'archived' },
  auto_redirect: '/courses/',       // redirect noindexed to archive
  indexnow_ping: true,
});`}</pre>
            <div className="mt-3 flex gap-2">
              <button onClick={()=>navigator.clipboard?.writeText('SEO.register({...})')} className="rounded px-3 py-1.5 text-xs border border-gray-300 text-gray-600 hover:bg-gray-50">📋 Copy</button>
              <span className="text-xs text-gray-400 pt-1.5">After calling register(), the type appears here as Active with all defaults applied.</span>
            </div>
          </Card>

          {/* Schema auto-assignment rules */}
          <Card title="Schema Auto-Assignment Rules">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Priority','Condition','Schema Assigned','Actions'].map(h=>(
                      <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    [100,'Content type = jobs','JobPosting'],
                    [90, 'Content type = companies','Organization'],
                    [80, 'Content type = blog','Article'],
                    [70, 'URL contains /faq/','FAQPage'],
                    [60, 'URL contains /events/','Event'],
                    [50, 'URL contains /courses/','Course'],
                    [0,  'Catch-all (any URL)','WebPage'],
                  ].map(([pri,cond,schema],i)=>(
                    <tr key={i} className="border-b border-gray-50">
                      <td className="px-3 py-2.5 font-bold text-[#1A3C6E] text-xs">{pri}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-600">{cond}</td>
                      <td className="px-3 py-2.5"><StatusBadge label={schema as string} color="blue" /></td>
                      <td className="px-3 py-2.5"><button className="rounded px-2 py-1 text-xs bg-gray-100 text-gray-600 hover:bg-gray-200">{pri===0?'(required)':'Edit'}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex gap-3 items-center">
              <input className={`${inp} max-w-xs`} placeholder="Test: /courses/react-bootcamp" />
              <button onClick={()=>alert('Match: Rule 50 — Content type = courses → Schema: Course')} className="rounded-lg bg-[#1A3C6E] text-white px-4 py-2 text-xs font-semibold hover:bg-[#0d2444] whitespace-nowrap">Test Schema Assignment</button>
            </div>
          </Card>
        </div>
      )}

      {/* ─────────────────────────── REGISTRATION WIZARD ─────────────────────── */}
      {showRegWizard && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-[#1A3C6E]">Register New Content Type</h2>
                <p className="text-xs text-gray-500 mt-0.5">Step {wizardStep} of 3</p>
              </div>
              <button onClick={()=>{setShowRegWizard(false);setWizardStep(1);}} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {/* Step indicator */}
              <div className="flex gap-2 mb-2">
                {[1,2,3].map(s=>(
                  <div key={s} className={`flex-1 h-1.5 rounded-full ${s<=wizardStep?'bg-[#1A3C6E]':'bg-gray-200'}`} />
                ))}
              </div>

              {wizardStep===1 && (
                <>
                  <p className="text-sm font-semibold text-gray-700">Step 1 — Identity</p>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Type Key (unique slug)*</label>
                    <input className={inp} value={newType_key} onChange={e=>setNewType_key(e.target.value.toLowerCase().replace(/\s/g,'-'))} placeholder="e.g. courses, events, freelancers" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Label (human-readable)*</label>
                    <input className={inp} value={newType_label} onChange={e=>setNewType_label(e.target.value)} placeholder="e.g. Online Courses" />
                  </div>
                </>
              )}

              {wizardStep===2 && (
                <>
                  <p className="text-sm font-semibold text-gray-700">Step 2 — URL & Schema</p>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">URL Pattern (use {'{slug}'} placeholder)</label>
                    <input className={inp} value={newType_url} onChange={e=>setNewType_url(e.target.value)} placeholder={`/${newType_key}/{slug}`} />
                    {newType_url && <p className="text-xs text-emerald-600 mt-1">✓ Example: {newType_url.replace('{slug}','example-item')}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Default Schema Type</label>
                    <select className={inp} value={newType_schema} onChange={e=>setNewType_schema(e.target.value)}>
                      {['WebPage','Article','Course','Event','Product','JobPosting','Organization','FAQPage','LocalBusiness','ItemList'].map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                </>
              )}

              {wizardStep===3 && (
                <>
                  <p className="text-sm font-semibold text-gray-700">Step 3 — Review & Activate</p>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Type Key</span><code className="text-[#1A3C6E] font-semibold">{newType_key}</code></div>
                    <div className="flex justify-between"><span className="text-gray-500">Label</span><span className="font-medium">{newType_label}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">URL Pattern</span><code className="text-gray-700">{newType_url || `/${newType_key}/{slug}`}</code></div>
                    <div className="flex justify-between"><span className="text-gray-500">Schema</span><StatusBadge label={newType_schema} color="blue" /></div>
                    <div className="flex justify-between"><span className="text-gray-500">Sitemap File</span><code className="text-gray-500">sitemap-{newType_key}.xml</code></div>
                  </div>
                  <p className="text-xs text-gray-500">Activating will: create the sitemap entry, add it to On-Page Manager, enable schema coverage, and add meta templates — all automatically.</p>
                </>
              )}
            </div>
            <div className="flex justify-between px-6 py-4 border-t border-gray-100">
              <button onClick={()=>wizardStep>1?setWizardStep(s=>s-1):setShowRegWizard(false)} className="rounded-lg border border-gray-300 px-5 py-2 text-sm text-gray-600 hover:bg-gray-50">
                {wizardStep===1?'Cancel':'Back'}
              </button>
              <button
                onClick={()=>{
                  if(wizardStep<3) setWizardStep(s=>s+1);
                  else registerType();
                }}
                disabled={wizardStep===1&&(!newType_key||!newType_label)}
                className="rounded-lg bg-[#1A3C6E] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0d2444] disabled:opacity-40"
              >
                {wizardStep<3?'Next →':'✓ Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
