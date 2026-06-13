'use client';

import { useState } from 'react';

interface CategoryAssignment {
  categoryId: number;
  categoryName: string;
  sortOrder: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  isGlobal: boolean;
  clicks: number;
  categories: CategoryAssignment[];
}

const ALL_CATEGORIES = [
  { id: 1, name: 'IT' },
  { id: 2, name: 'Marketing' },
  { id: 3, name: 'Finance' },
  { id: 4, name: 'HR' },
  { id: 5, name: 'Sales' },
  { id: 6, name: 'Engineering' },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Gulf Talent Pro',
    description: 'Premium job board for GCC professionals.',
    imageUrl: 'https://placehold.co/300x150/1A3C6E/white?text=Gulf+Talent',
    linkUrl: 'https://gulftalent.com',
    isActive: true,
    isGlobal: true,
    clicks: 3420,
    categories: [],
  },
  {
    id: 2,
    name: 'Naukri Gulf',
    description: 'Leading recruitment platform in Middle East.',
    imageUrl: 'https://placehold.co/300x150/FF6B35/white?text=Naukri+Gulf',
    linkUrl: 'https://naukrigulf.com',
    isActive: true,
    isGlobal: false,
    clicks: 1870,
    categories: [
      { categoryId: 1, categoryName: 'IT', sortOrder: 1 },
      { categoryId: 3, categoryName: 'Finance', sortOrder: 2 },
    ],
  },
  {
    id: 3,
    name: 'Bayt Premium',
    description: 'Top-tier job portal for MENA region.',
    imageUrl: 'https://placehold.co/300x150/FFB400/white?text=Bayt',
    linkUrl: 'https://bayt.com',
    isActive: false,
    isGlobal: true,
    clicks: 892,
    categories: [],
  },
  {
    id: 4,
    name: 'Indeed UAE',
    description: 'Global jobs aggregator, UAE edition.',
    imageUrl: 'https://placehold.co/300x150/4A90D9/white?text=Indeed+UAE',
    linkUrl: 'https://indeed.com/ae',
    isActive: true,
    isGlobal: false,
    clicks: 5124,
    categories: [
      { categoryId: 2, categoryName: 'Marketing', sortOrder: 1 },
      { categoryId: 5, categoryName: 'Sales', sortOrder: 2 },
    ],
  },
];

const EMPTY_FORM = { name: '', description: '', imageUrl: '', linkUrl: '', isActive: true, isGlobal: false };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [modal, setModal] = useState<'add' | 'edit' | 'assign' | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [assignTarget, setAssignTarget] = useState<Product | null>(null);
  const [assignSelections, setAssignSelections] = useState<Record<number, { selected: boolean; sortOrder: number }>>({});

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setModal('add');
  };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({ name: p.name, description: p.description, imageUrl: p.imageUrl, linkUrl: p.linkUrl, isActive: p.isActive, isGlobal: p.isGlobal });
    setModal('edit');
  };

  const openAssign = (p: Product) => {
    setAssignTarget(p);
    const sel: Record<number, { selected: boolean; sortOrder: number }> = {};
    ALL_CATEGORIES.forEach((c) => {
      const existing = p.categories.find((a) => a.categoryId === c.id);
      sel[c.id] = { selected: !!existing, sortOrder: existing?.sortOrder ?? 99 };
    });
    setAssignSelections(sel);
    setModal('assign');
  };

  const saveProduct = () => {
    if (!form.name.trim()) return;
    if (modal === 'add') {
      setProducts((prev) => [...prev, { id: Date.now(), ...form, clicks: 0, categories: [] }]);
    } else if (editId) {
      setProducts((prev) => prev.map((p) => (p.id === editId ? { ...p, ...form } : p)));
    }
    setModal(null);
  };

  const saveAssign = () => {
    if (!assignTarget) return;
    const cats: CategoryAssignment[] = ALL_CATEGORIES.filter((c) => assignSelections[c.id]?.selected).map((c) => ({
      categoryId: c.id,
      categoryName: c.name,
      sortOrder: assignSelections[c.id]?.sortOrder ?? 99,
    }));
    setProducts((prev) => prev.map((p) => (p.id === assignTarget.id ? { ...p, categories: cats } : p)));
    setModal(null);
  };

  const toggleField = (id: number, field: 'isActive' | 'isGlobal') =>
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: !p[field] } : p)));

  const deleteProduct = (id: number) => {
    if (confirm('Delete this product banner?')) setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Manage promotional product banners displayed on the job portal.</p>
        <button onClick={openAdd} className="rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d2444] transition-colors">
          + Add Product
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all ${product.isActive ? 'border-gray-100' : 'border-gray-200 opacity-70'}`}
          >
            <div className="relative">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-36 object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/300x150/1A3C6E/white?text=${encodeURIComponent(product.name)}`; }}
              />
              <div className="absolute top-2 right-2 flex gap-1.5">
                {product.isGlobal && (
                  <span className="rounded-full bg-[#1A3C6E] text-white text-xs px-2 py-0.5 font-medium">Global</span>
                )}
                {!product.isActive && (
                  <span className="rounded-full bg-gray-600 text-white text-xs px-2 py-0.5 font-medium">Inactive</span>
                )}
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-gray-800 mb-1">{product.name}</h4>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.description}</p>
              <div className="text-xs text-gray-400 mb-3 truncate">
                <span className="font-medium text-gray-500">Link:</span> {product.linkUrl}
              </div>
              {product.categories.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {product.categories.map((c) => (
                    <span key={c.categoryId} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{c.categoryName}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>Clicks: <strong className="text-gray-700">{product.clicks.toLocaleString()}</strong></span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <button
                      onClick={() => toggleField(product.id, 'isActive')}
                      className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${product.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-3 w-3 rounded-full bg-white shadow transition-transform ${product.isActive ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                    </button>
                    <span>Active</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <button
                      onClick={() => toggleField(product.id, 'isGlobal')}
                      className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${product.isGlobal ? 'bg-[#1A3C6E]' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-3 w-3 rounded-full bg-white shadow transition-transform ${product.isGlobal ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                    </button>
                    <span>Global</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(product)} className="flex-1 rounded-lg border border-blue-300 bg-blue-50 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors">Edit</button>
                <button onClick={() => openAssign(product)} className="flex-1 rounded-lg border border-[#FFB400]/50 bg-[#FFB400]/10 py-1.5 text-xs font-medium text-amber-700 hover:bg-[#FFB400]/20 transition-colors">Categories</button>
                <button onClick={() => deleteProduct(product.id)} className="flex-1 rounded-lg border border-red-200 bg-red-50 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">{modal === 'add' ? 'Add Product Banner' : 'Edit Product'}</h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E] resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input type="url" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                <input type="url" value={form.linkUrl} onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))} placeholder="https://..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]" />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="rounded" /><span className="text-sm text-gray-700">Active</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isGlobal} onChange={(e) => setForm((f) => ({ ...f, isGlobal: e.target.checked }))} className="rounded" /><span className="text-sm text-gray-700">Show Globally</span></label>
              </div>
            </div>
            <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100">
              <button onClick={() => setModal(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={saveProduct} className="rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d2444]">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Categories Modal */}
      {modal === 'assign' && assignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-800">Category Assignment</h3>
                <p className="text-xs text-gray-500 mt-0.5">{assignTarget.name}</p>
              </div>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="px-6 py-4 space-y-3">
              {ALL_CATEGORIES.map((cat) => (
                <div key={cat.id} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`cat-${cat.id}`}
                    checked={assignSelections[cat.id]?.selected ?? false}
                    onChange={(e) => setAssignSelections((prev) => ({ ...prev, [cat.id]: { ...prev[cat.id], selected: e.target.checked } }))}
                    className="rounded"
                  />
                  <label htmlFor={`cat-${cat.id}`} className="text-sm text-gray-700 flex-1">{cat.name}</label>
                  <input
                    type="number"
                    min={1}
                    value={assignSelections[cat.id]?.sortOrder ?? 99}
                    onChange={(e) => setAssignSelections((prev) => ({ ...prev, [cat.id]: { ...prev[cat.id], sortOrder: Number(e.target.value) } }))}
                    disabled={!assignSelections[cat.id]?.selected}
                    placeholder="Sort"
                    className="w-16 rounded border border-gray-300 px-2 py-1 text-xs text-center disabled:opacity-40 focus:outline-none focus:ring-1 focus:ring-[#1A3C6E]"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100">
              <button onClick={() => setModal(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={saveAssign} className="rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d2444]">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
