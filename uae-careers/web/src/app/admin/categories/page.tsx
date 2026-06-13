'use client';

import { useState } from 'react';

type ApplyMethod = 'email' | 'phone' | 'whatsapp' | 'external' | 'platform';
type AdType = 'banner' | 'interstitial' | 'rewarded' | 'none';

interface Category {
  id: number;
  name: string;
  jobsCount: number;
  isActive: boolean;
  adsEnabled: boolean;
  adType: AdType;
  applyMethod: ApplyMethod;
  sortOrder: number;
}

const INITIAL_CATS: Category[] = [
  { id: 1, name: 'Information Technology', jobsCount: 1240, isActive: true,  adsEnabled: true,  adType: 'banner',        applyMethod: 'platform',  sortOrder: 1 },
  { id: 2, name: 'Marketing',              jobsCount: 432,  isActive: true,  adsEnabled: true,  adType: 'rewarded',      applyMethod: 'email',     sortOrder: 2 },
  { id: 3, name: 'Finance',                jobsCount: 387,  isActive: true,  adsEnabled: false, adType: 'none',          applyMethod: 'platform',  sortOrder: 3 },
  { id: 4, name: 'Human Resources',        jobsCount: 198,  isActive: true,  adsEnabled: true,  adType: 'banner',        applyMethod: 'email',     sortOrder: 4 },
  { id: 5, name: 'Sales',                  jobsCount: 567,  isActive: true,  adsEnabled: true,  adType: 'interstitial',  applyMethod: 'phone',     sortOrder: 5 },
  { id: 6, name: 'Engineering',            jobsCount: 321,  isActive: true,  adsEnabled: false, adType: 'none',          applyMethod: 'external',  sortOrder: 6 },
  { id: 7, name: 'Healthcare',             jobsCount: 289,  isActive: true,  adsEnabled: true,  adType: 'banner',        applyMethod: 'platform',  sortOrder: 7 },
  { id: 8, name: 'Design',                 jobsCount: 143,  isActive: false, adsEnabled: false, adType: 'none',          applyMethod: 'email',     sortOrder: 8 },
  { id: 9, name: 'Education',              jobsCount: 212,  isActive: true,  adsEnabled: true,  adType: 'rewarded',      applyMethod: 'platform',  sortOrder: 9 },
  { id: 10, name: 'Hospitality',           jobsCount: 154,  isActive: true,  adsEnabled: true,  adType: 'banner',        applyMethod: 'whatsapp',  sortOrder: 10 },
];

const EMPTY_CAT: Omit<Category, 'id' | 'sortOrder' | 'jobsCount'> = {
  name: '',
  isActive: true,
  adsEnabled: false,
  adType: 'none',
  applyMethod: 'platform',
};

const AD_TYPES: AdType[] = ['none', 'banner', 'interstitial', 'rewarded'];
const APPLY_METHODS: ApplyMethod[] = ['platform', 'email', 'phone', 'whatsapp', 'external'];

export default function AdminCategoriesPage() {
  const [cats, setCats] = useState<Category[]>(INITIAL_CATS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(EMPTY_CAT);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_CAT);
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, isActive: cat.isActive, adsEnabled: cat.adsEnabled, adType: cat.adType, applyMethod: cat.applyMethod });
    setModalOpen(true);
  };

  const saveModal = () => {
    if (!form.name.trim()) return;
    if (editing) {
      setCats((prev) => prev.map((c) => c.id === editing.id ? { ...c, ...form } : c));
    } else {
      const newCat: Category = {
        id: Date.now(),
        jobsCount: 0,
        sortOrder: cats.length + 1,
        ...form,
      };
      setCats((prev) => [...prev, newCat]);
    }
    setModalOpen(false);
  };

  const toggleField = (id: number, field: 'isActive' | 'adsEnabled') =>
    setCats((prev) => prev.map((c) => c.id === id ? { ...c, [field]: !c[field] } : c));

  const updateField = (id: number, field: 'adType' | 'applyMethod', value: string) =>
    setCats((prev) => prev.map((c) => c.id === id ? { ...c, [field]: value } : c));

  const confirmDelete = (id: number) => setDeleteConfirm(id);
  const doDelete = () => {
    if (deleteConfirm) setCats((prev) => prev.filter((c) => c.id !== deleteConfirm));
    setDeleteConfirm(null);
  };

  const handleDragStart = (id: number) => setDragging(id);
  const handleDragOver = (e: React.DragEvent, id: number) => { e.preventDefault(); setDragOver(id); };
  const handleDrop = (targetId: number) => {
    if (!dragging || dragging === targetId) { setDragging(null); setDragOver(null); return; }
    setCats((prev) => {
      const arr = [...prev];
      const fromIdx = arr.findIndex((c) => c.id === dragging);
      const toIdx = arr.findIndex((c) => c.id === targetId);
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return arr.map((c, i) => ({ ...c, sortOrder: i + 1 }));
    });
    setDragging(null);
    setDragOver(null);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-800">Categories</h3>
            <p className="text-xs text-gray-500 mt-0.5">Drag rows to reorder. Changes to toggles save immediately.</p>
          </div>
          <button onClick={openAdd} className="rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d2444] transition-colors">
            + Add Category
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Jobs</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Active</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ads</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ad Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Apply Method</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cats.map((cat, i) => (
                <tr
                  key={cat.id}
                  draggable
                  onDragStart={() => handleDragStart(cat.id)}
                  onDragOver={(e) => handleDragOver(e, cat.id)}
                  onDrop={() => handleDrop(cat.id)}
                  onDragEnd={() => { setDragging(null); setDragOver(null); }}
                  className={`border-b border-gray-50 transition-colors cursor-grab active:cursor-grabbing
                    ${dragOver === cat.id ? 'bg-blue-50 border-[#1A3C6E]' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}
                    hover:bg-blue-50/30`}
                >
                  <td className="px-3 py-3 text-gray-400 text-xs font-mono">{cat.sortOrder}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-600">{cat.jobsCount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleField(cat.id, 'isActive')}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${cat.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${cat.isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleField(cat.id, 'adsEnabled')}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${cat.adsEnabled ? 'bg-[#FF6B35]' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${cat.adsEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={cat.adType}
                      onChange={(e) => updateField(cat.id, 'adType', e.target.value)}
                      disabled={!cat.adsEnabled}
                      className="rounded border border-gray-300 px-2 py-1 text-xs disabled:opacity-40 focus:outline-none focus:ring-1 focus:ring-[#1A3C6E]"
                    >
                      {AD_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={cat.applyMethod}
                      onChange={(e) => updateField(cat.id, 'applyMethod', e.target.value)}
                      className="rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#1A3C6E]"
                    >
                      {APPLY_METHODS.map((m) => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(cat)} className="rounded px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200">Edit</button>
                      <button onClick={() => confirmDelete(cat.id)} className="rounded px-2 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">{editing ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Information Technology"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ad Type</label>
                  <select
                    value={form.adType}
                    onChange={(e) => setForm((f) => ({ ...f, adType: e.target.value as AdType }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
                  >
                    {AD_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apply Method</label>
                  <select
                    value={form.applyMethod}
                    onChange={(e) => setForm((f) => ({ ...f, applyMethod: e.target.value as ApplyMethod }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
                  >
                    {APPLY_METHODS.map((m) => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="rounded" />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.adsEnabled} onChange={(e) => setForm((f) => ({ ...f, adsEnabled: e.target.checked }))} className="rounded" />
                  <span className="text-sm text-gray-700">Ads Enabled</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100">
              <button onClick={() => setModalOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={saveModal} className="rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d2444]">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3 text-red-600 text-xl">!</div>
            <h3 className="font-semibold text-gray-800 mb-1">Delete Category?</h3>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone. Jobs in this category will need reassignment.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteConfirm(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={doDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
