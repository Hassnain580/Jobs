'use client';

import { useState } from 'react';

interface CmsVersion {
  id: number;
  content: string;
  savedAt: string;
  savedBy: string;
}

interface CmsItem {
  key: string;
  label: string;
  page: string;
  content: string;
  published: boolean;
  versions: CmsVersion[];
}

const INITIAL_CMS: CmsItem[] = [
  {
    key: 'home.hero.title',
    label: 'Hero Title',
    page: 'Home Page',
    content: 'Find Your Dream Job in the UAE & Gulf',
    published: true,
    versions: [
      { id: 1, content: 'Find Your Dream Job in the UAE & Gulf', savedAt: '2026-06-10 14:30', savedBy: 'Super Admin' },
      { id: 2, content: 'Discover Top Jobs in the Gulf Region', savedAt: '2026-06-01 09:15', savedBy: 'Content Editor' },
    ],
  },
  {
    key: 'home.hero.subtitle',
    label: 'Hero Subtitle',
    page: 'Home Page',
    content: 'Browse thousands of verified job listings across UAE, KSA, Qatar, Kuwait, Bahrain and Oman.',
    published: true,
    versions: [
      { id: 1, content: 'Browse thousands of verified job listings across UAE, KSA, Qatar, Kuwait, Bahrain and Oman.', savedAt: '2026-06-10 14:31', savedBy: 'Super Admin' },
    ],
  },
  {
    key: 'home.cta.primary',
    label: 'Primary CTA Button',
    page: 'Home Page',
    content: 'Search Jobs',
    published: true,
    versions: [{ id: 1, content: 'Search Jobs', savedAt: '2026-06-01 09:15', savedBy: 'Super Admin' }],
  },
  {
    key: 'home.stats.users',
    label: 'Users Count Label',
    page: 'Home Page',
    content: '500,000+ Registered Job Seekers',
    published: true,
    versions: [{ id: 1, content: '500,000+ Registered Job Seekers', savedAt: '2026-06-01 09:15', savedBy: 'Super Admin' }],
  },
  {
    key: 'fraud.notice',
    label: 'Fraud Warning Notice',
    page: 'Global',
    content: 'UAE Careers never asks for money. Beware of fraudulent job offers. Report suspicious activity to our fraud team.',
    published: true,
    versions: [
      { id: 1, content: 'UAE Careers never asks for money. Beware of fraudulent job offers. Report suspicious activity to our fraud team.', savedAt: '2026-06-05 10:00', savedBy: 'Super Admin' },
    ],
  },
  {
    key: 'footer.copyright',
    label: 'Footer Copyright',
    page: 'Global',
    content: '© 2026 UAE Careers. All rights reserved.',
    published: true,
    versions: [{ id: 1, content: '© 2026 UAE Careers. All rights reserved.', savedAt: '2026-06-01 09:15', savedBy: 'Super Admin' }],
  },
  {
    key: 'footer.tagline',
    label: 'Footer Tagline',
    page: 'Global',
    content: "Your trusted partner in the GCC's job market.",
    published: true,
    versions: [{ id: 1, content: "Your trusted partner in the GCC's job market.", savedAt: '2026-06-01 09:15', savedBy: 'Super Admin' }],
  },
  {
    key: 'jobs.empty.message',
    label: 'No Jobs Found Message',
    page: 'Jobs Page',
    content: 'No jobs match your search. Try different keywords or broaden your filters.',
    published: true,
    versions: [{ id: 1, content: 'No jobs match your search. Try different keywords or broaden your filters.', savedAt: '2026-06-01 09:15', savedBy: 'Super Admin' }],
  },
  {
    key: 'jobs.apply.gate.message',
    label: 'Apply Gate Message',
    page: 'Jobs Page',
    content: 'You have viewed your free jobs. Watch a short ad to continue browsing.',
    published: false,
    versions: [{ id: 1, content: 'You have viewed your free jobs. Watch a short ad to continue browsing.', savedAt: '2026-06-12 16:45', savedBy: 'Content Editor' }],
  },
  {
    key: 'profile.incomplete.banner',
    label: 'Incomplete Profile Banner',
    page: 'Dashboard',
    content: 'Complete your profile to increase your chances of getting hired by 3x.',
    published: true,
    versions: [{ id: 1, content: 'Complete your profile to increase your chances of getting hired by 3x.', savedAt: '2026-06-03 11:00', savedBy: 'Super Admin' }],
  },
  {
    key: 'about.mission',
    label: 'Mission Statement',
    page: 'About Page',
    content: 'Our mission is to connect talented professionals with leading employers across the Gulf Cooperation Council nations, fostering economic growth and career development.',
    published: true,
    versions: [{ id: 1, content: 'Our mission is to connect talented professionals with leading employers across the Gulf Cooperation Council nations, fostering economic growth and career development.', savedAt: '2026-06-01 09:15', savedBy: 'Super Admin' }],
  },
  {
    key: 'contact.support.hours',
    label: 'Support Hours Text',
    page: 'Contact Page',
    content: 'Our support team is available Sunday - Thursday, 9 AM - 6 PM (GST).',
    published: true,
    versions: [{ id: 1, content: 'Our support team is available Sunday - Thursday, 9 AM - 6 PM (GST).', savedAt: '2026-06-01 09:15', savedBy: 'Super Admin' }],
  },
];

export default function AdminCmsPage() {
  const [items, setItems] = useState<CmsItem[]>(INITIAL_CMS);
  const [selected, setSelected] = useState<CmsItem | null>(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [search, setSearch] = useState('');

  const grouped = INITIAL_CMS.reduce<Record<string, CmsItem[]>>((acc, item) => {
    if (!acc[item.page]) acc[item.page] = [];
    return acc;
  }, {});

  items
    .filter((item) => {
      const q = search.toLowerCase();
      return item.key.includes(q) || item.label.toLowerCase().includes(q) || item.page.toLowerCase().includes(q);
    })
    .forEach((item) => {
      if (!grouped[item.page]) grouped[item.page] = [];
      grouped[item.page].push(item);
    });

  const selectItem = (item: CmsItem) => {
    setSelected(item);
    setDraft(item.content);
    setSaved(false);
    setShowHistory(false);
  };

  const handleSave = () => {
    if (!selected) return;
    setSaving(true);
    setTimeout(() => {
      const newVersion: CmsVersion = {
        id: Date.now(),
        content: draft,
        savedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        savedBy: 'Super Admin',
      };
      setItems((prev) =>
        prev.map((item) =>
          item.key === selected.key
            ? { ...item, content: draft, versions: [newVersion, ...item.versions] }
            : item
        )
      );
      setSelected((prev) => prev ? { ...prev, content: draft, versions: [newVersion, ...prev.versions] } : null);
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 600);
  };

  const togglePublish = (key: string) => {
    setItems((prev) => prev.map((item) => (item.key === key ? { ...item, published: !item.published } : item)));
    if (selected?.key === key) setSelected((prev) => prev ? { ...prev, published: !prev.published } : null);
  };

  const restoreVersion = (version: CmsVersion) => {
    setDraft(version.content);
    setShowHistory(false);
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      {/* Sidebar list */}
      <div className="w-72 shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-gray-100">
          <input
            type="text"
            placeholder="Search content keys..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {Object.entries(grouped).map(([page, pageItems]) => (
            <div key={page}>
              <div className="px-3 py-2 bg-gray-50 border-y border-gray-100">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{page}</span>
              </div>
              {pageItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => selectItem(items.find((i) => i.key === item.key) ?? item)}
                  className={`w-full text-left px-3 py-2.5 border-b border-gray-50 transition-colors ${
                    selected?.key === item.key ? 'bg-[#1A3C6E]/5 border-l-2 border-l-[#1A3C6E]' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-gray-700 truncate">{item.label}</span>
                    <span className={`shrink-0 w-2 h-2 rounded-full ${items.find((i) => i.key === item.key)?.published ? 'bg-emerald-400' : 'bg-gray-300'}`} />
                  </div>
                  <span className="text-xs text-gray-400 font-mono truncate block">{item.key}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-5xl mb-3">📝</div>
              <p className="text-sm">Select a content item from the left to edit.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-800">{selected.label}</h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{selected.key}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    History ({selected.versions.length})
                  </button>
                  <button
                    onClick={() => togglePublish(selected.key)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      selected.published
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    }`}
                  >
                    {selected.published ? 'Published' : 'Unpublished'}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || draft === selected.content}
                    className="rounded-lg bg-[#1A3C6E] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#0d2444] disabled:opacity-50 transition-colors"
                  >
                    {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Text editor */}
              <div className="flex-1 p-5">
                <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Content</label>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="w-full h-full resize-none rounded-lg border border-gray-200 p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1A3C6E] font-mono leading-relaxed"
                  placeholder="Enter content here..."
                />
              </div>

              {/* History panel */}
              {showHistory && (
                <div className="w-72 border-l border-gray-100 flex flex-col overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Version History</h4>
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                    {selected.versions.map((v, idx) => (
                      <div key={v.id} className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-700">{idx === 0 ? 'Current' : `v${selected.versions.length - idx}`}</span>
                          {idx !== 0 && (
                            <button onClick={() => restoreVersion(v)} className="text-xs text-[#1A3C6E] hover:underline font-medium">Restore</button>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mb-1">{v.savedAt} · {v.savedBy}</p>
                        <p className="text-xs text-gray-600 line-clamp-3 bg-gray-50 rounded p-2 font-mono">{v.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
