'use client';

import { useState } from 'react';

type AdminRole = 'super_admin' | 'content_editor' | 'support' | 'finance';

interface Permission {
  module: string;
  label: string;
  perms: { key: string; label: string }[];
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
  permissions: string[];
  lastLogin: string;
  isActive: boolean;
}

const PERMISSION_GROUPS: Permission[] = [
  {
    module: 'user_mgmt',
    label: 'User Management',
    perms: [
      { key: 'users.view', label: 'View Users' },
      { key: 'users.approve', label: 'Approve/Reject' },
      { key: 'users.ban', label: 'Ban Users' },
      { key: 'users.delete', label: 'Delete Users' },
    ],
  },
  {
    module: 'jobs',
    label: 'Jobs',
    perms: [
      { key: 'jobs.view', label: 'View Jobs' },
      { key: 'jobs.approve', label: 'Approve/Reject' },
      { key: 'jobs.edit', label: 'Edit Jobs' },
      { key: 'jobs.delete', label: 'Delete Jobs' },
    ],
  },
  {
    module: 'cms',
    label: 'CMS Content',
    perms: [
      { key: 'cms.view', label: 'View Content' },
      { key: 'cms.edit', label: 'Edit Content' },
      { key: 'cms.publish', label: 'Publish/Unpublish' },
    ],
  },
  {
    module: 'ads',
    label: 'Ads & Products',
    perms: [
      { key: 'ads.view', label: 'View Ads' },
      { key: 'ads.manage', label: 'Manage Banners' },
      { key: 'ads.settings', label: 'Ad Settings' },
    ],
  },
  {
    module: 'payments',
    label: 'Payments',
    perms: [
      { key: 'payments.view', label: 'View Revenue' },
      { key: 'payments.refund', label: 'Issue Refunds' },
      { key: 'payments.settings', label: 'Payment Settings' },
    ],
  },
  {
    module: 'settings',
    label: 'Settings',
    perms: [
      { key: 'settings.general', label: 'General Settings' },
      { key: 'settings.advanced', label: 'Advanced Settings' },
    ],
  },
  {
    module: 'analytics',
    label: 'Analytics',
    perms: [
      { key: 'analytics.view', label: 'View Analytics' },
      { key: 'analytics.export', label: 'Export Reports' },
    ],
  },
];

const ALL_PERMS = PERMISSION_GROUPS.flatMap((g) => g.perms.map((p) => p.key));

const ROLE_CONFIG: Record<AdminRole, { label: string; classes: string }> = {
  super_admin:    { label: 'Super Admin',     classes: 'bg-[#1A3C6E] text-white' },
  content_editor: { label: 'Content Editor', classes: 'bg-purple-100 text-purple-700' },
  support:        { label: 'Support',         classes: 'bg-blue-100 text-blue-700' },
  finance:        { label: 'Finance',         classes: 'bg-amber-100 text-amber-700' },
};

const INITIAL_ADMINS: AdminUser[] = [
  { id: 1, name: 'Khalid Al Nasser', email: 'khalid@uaecareers.com', role: 'super_admin', permissions: ALL_PERMS, lastLogin: '2026-06-13 09:15', isActive: true },
  { id: 2, name: 'Aisha Mohammed', email: 'aisha@uaecareers.com', role: 'content_editor', permissions: ['cms.view', 'cms.edit', 'cms.publish', 'ads.view', 'ads.manage'], lastLogin: '2026-06-12 14:30', isActive: true },
  { id: 3, name: 'James Cooper', email: 'james@uaecareers.com', role: 'support', permissions: ['users.view', 'users.approve', 'users.ban', 'jobs.view', 'jobs.approve'], lastLogin: '2026-06-13 08:00', isActive: true },
  { id: 4, name: 'Rania Aziz', email: 'rania@uaecareers.com', role: 'finance', permissions: ['payments.view', 'payments.refund', 'analytics.view', 'analytics.export'], lastLogin: '2026-06-11 16:45', isActive: false },
];

const EMPTY_FORM = { name: '', email: '', role: 'support' as AdminRole, permissions: [] as string[] };

function permSummary(perms: string[], role: AdminRole): string {
  if (role === 'super_admin') return 'All permissions';
  const count = perms.length;
  const total = ALL_PERMS.length;
  return `${count}/${total} permissions`;
}

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>(INITIAL_ADMINS);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setModal('create');
  };

  const openEdit = (admin: AdminUser) => {
    setEditId(admin.id);
    setForm({ name: admin.name, email: admin.email, role: admin.role, permissions: [...admin.permissions] });
    setModal('edit');
  };

  const saveModal = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    const perms = form.role === 'super_admin' ? ALL_PERMS : form.permissions;
    if (modal === 'create') {
      setAdmins((prev) => [...prev, { id: Date.now(), ...form, permissions: perms, lastLogin: 'Never', isActive: true }]);
    } else if (editId) {
      setAdmins((prev) => prev.map((a) => (a.id === editId ? { ...a, ...form, permissions: perms } : a)));
    }
    setModal(null);
  };

  const toggleActive = (id: number) =>
    setAdmins((prev) => prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a)));

  const doDelete = () => {
    if (deleteConfirm) setAdmins((prev) => prev.filter((a) => a.id !== deleteConfirm));
    setDeleteConfirm(null);
  };

  const togglePerm = (key: string) => {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(key) ? f.permissions.filter((p) => p !== key) : [...f.permissions, key],
    }));
  };

  const toggleModule = (group: Permission) => {
    const keys = group.perms.map((p) => p.key);
    const allSelected = keys.every((k) => form.permissions.includes(k));
    setForm((f) => ({
      ...f,
      permissions: allSelected
        ? f.permissions.filter((p) => !keys.includes(p))
        : [...new Set([...f.permissions, ...keys])],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Manage admin panel users and their permissions. <strong className="text-red-500">Super Admin only.</strong>
        </div>
        <button onClick={openCreate} className="rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d2444] transition-colors">
          + Create Admin
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Admin</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Permissions</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Last Login</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin, i) => (
                <tr key={admin.id} className={`border-b border-gray-50 hover:bg-blue-50/30 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1A3C6E] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {admin.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{admin.name}</div>
                        <div className="text-xs text-gray-400">{admin.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_CONFIG[admin.role].classes}`}>
                      {ROLE_CONFIG[admin.role].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{permSummary(admin.permissions, admin.role)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{admin.lastLogin}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => admin.role !== 'super_admin' && toggleActive(admin.id)}
                      disabled={admin.role === 'super_admin'}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:cursor-not-allowed ${admin.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${admin.isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(admin)} className="rounded px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200">Edit</button>
                      {admin.role !== 'super_admin' && (
                        <button onClick={() => setDeleteConfirm(admin.id)} className="rounded px-2 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200">Del</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">{modal === 'create' ? 'Create Admin User' : 'Edit Admin User'}</h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="px-6 py-4 space-y-5">
              {/* Basic info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as AdminRole }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
                >
                  <option value="super_admin">Super Admin (all permissions)</option>
                  <option value="content_editor">Content Editor</option>
                  <option value="support">Support</option>
                  <option value="finance">Finance</option>
                </select>
              </div>

              {/* Permissions */}
              {form.role !== 'super_admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
                  <div className="space-y-4">
                    {PERMISSION_GROUPS.map((group) => {
                      const keys = group.perms.map((p) => p.key);
                      const allSelected = keys.every((k) => form.permissions.includes(k));
                      const someSelected = keys.some((k) => form.permissions.includes(k));
                      return (
                        <div key={group.module} className="border border-gray-100 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="checkbox"
                              id={`mod-${group.module}`}
                              checked={allSelected}
                              ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                              onChange={() => toggleModule(group)}
                              className="rounded"
                            />
                            <label htmlFor={`mod-${group.module}`} className="text-sm font-semibold text-gray-700 cursor-pointer">{group.label}</label>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 pl-5">
                            {group.perms.map((perm) => (
                              <label key={perm.key} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={form.permissions.includes(perm.key)}
                                  onChange={() => togglePerm(perm.key)}
                                  className="rounded"
                                />
                                <span className="text-xs text-gray-600">{perm.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100">
              <button onClick={() => setModal(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
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
            <h3 className="font-semibold text-gray-800 mb-1">Delete Admin?</h3>
            <p className="text-sm text-gray-500 mb-5">This admin will lose all access immediately.</p>
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
