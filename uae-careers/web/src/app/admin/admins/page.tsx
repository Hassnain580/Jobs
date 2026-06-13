'use client';

import { useState } from 'react';
import { X, Shield, Eye, Edit2, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';

type AdminStatus = 'active' | 'inactive' | 'suspended';

interface Permission { module: string; icon: string; actions: { key: string; label: string }[]; }
interface AdminUser {
  id: number; name: string; email: string; role: string; status: AdminStatus;
  lastLogin: string; createdAt: string; permissions: Record<string, string[]>; isSuperAdmin?: boolean;
}

const PERMISSION_MODULES: Permission[] = [
  { module: 'dashboard',   icon: '⊞', actions: [{ key: 'view', label: 'View' }] },
  { module: 'jobs',        icon: '💼', actions: [{ key: 'view', label: 'View' }, { key: 'create', label: 'Create' }, { key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' }, { key: 'approve', label: 'Approve/Reject' }] },
  { module: 'users',       icon: '👥', actions: [{ key: 'view', label: 'View' }, { key: 'create', label: 'Create' }, { key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' }, { key: 'ban', label: 'Ban/Unban' }] },
  { module: 'employers',   icon: '🏢', actions: [{ key: 'view', label: 'View' }, { key: 'edit', label: 'Edit' }, { key: 'approve', label: 'Approve/Suspend' }, { key: 'verify', label: 'Verify' }, { key: 'delete', label: 'Delete' }] },
  { module: 'categories',  icon: '🗂', actions: [{ key: 'view', label: 'View' }, { key: 'create', label: 'Create' }, { key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' }] },
  { module: 'countries',   icon: '🌍', actions: [{ key: 'view', label: 'View' }, { key: 'edit', label: 'Edit' }] },
  { module: 'products',    icon: '🖼', actions: [{ key: 'view', label: 'View' }, { key: 'create', label: 'Create' }, { key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' }] },
  { module: 'cms',         icon: '📝', actions: [{ key: 'view', label: 'View' }, { key: 'edit', label: 'Edit' }, { key: 'publish', label: 'Publish' }] },
  { module: 'seo',         icon: '🔍', actions: [{ key: 'view', label: 'View' }, { key: 'edit', label: 'Edit' }, { key: 'redirects', label: 'Redirects' }, { key: 'sitemap', label: 'Sitemap' }] },
  { module: 'analytics',   icon: '📊', actions: [{ key: 'view', label: 'View' }, { key: 'export', label: 'Export' }] },
  { module: 'settings',    icon: '⚙', actions: [{ key: 'view', label: 'View' }, { key: 'edit', label: 'Edit' }] },
  { module: 'admin_users', icon: '🔐', actions: [{ key: 'view', label: 'View' }, { key: 'create', label: 'Create' }, { key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' }] },
];

const totalPermissions = PERMISSION_MODULES.reduce((s, m) => s + m.actions.length, 0);
const countPerms = (p: Record<string, string[]>) => Object.values(p).reduce((s, a) => s + a.length, 0);

const ROLE_PRESETS: Record<string, { label: string; color: string; permissions: Record<string, string[]> }> = {
  super_admin:    { label: 'Super Admin',         color: 'bg-[#FFB400]/20 text-[#b37e00]',   permissions: Object.fromEntries(PERMISSION_MODULES.map(m => [m.module, m.actions.map(a => a.key)])) },
  admin:          { label: 'Admin',               color: 'bg-purple-100 text-purple-700',    permissions: { dashboard:['view'], jobs:['view','create','edit','approve'], users:['view','edit','ban'], employers:['view','edit','approve','verify'], categories:['view','create','edit'], countries:['view'], products:['view','create','edit'], cms:['view','edit','publish'], seo:['view','edit'], analytics:['view'], settings:['view'], admin_users:[] } },
  content_editor: { label: 'Content Editor',      color: 'bg-blue-100 text-blue-700',        permissions: { dashboard:['view'], jobs:['view','edit'], users:['view'], employers:['view'], categories:['view','edit'], countries:['view'], products:['view','edit'], cms:['view','edit','publish'], seo:['view','edit'], analytics:['view'], settings:[], admin_users:[] } },
  job_moderator:  { label: 'Job Moderator',       color: 'bg-emerald-100 text-emerald-700',  permissions: { dashboard:['view'], jobs:['view','edit','approve','delete'], users:['view'], employers:['view','approve'], categories:['view'], countries:['view'], products:[], cms:[], seo:[], analytics:['view'], settings:[], admin_users:[] } },
  analyst:        { label: 'Analyst',             color: 'bg-indigo-100 text-indigo-700',    permissions: { dashboard:['view'], jobs:['view'], users:['view'], employers:['view'], categories:['view'], countries:['view'], products:[], cms:[], seo:['view'], analytics:['view','export'], settings:[], admin_users:[] } },
  viewer:         { label: 'Viewer (Read-Only)',   color: 'bg-gray-100 text-gray-600',        permissions: Object.fromEntries(PERMISSION_MODULES.map(m => [m.module, ['view']])) },
};

const INITIAL_ADMINS: AdminUser[] = [
  { id:1, name:'Super Admin',        email:'admin@uaecareer.ae',      role:'super_admin',    status:'active',   lastLogin:'2026-06-13 19:45', createdAt:'2026-01-01', permissions:ROLE_PRESETS.super_admin.permissions,    isSuperAdmin:true },
  { id:2, name:'Sarah Content',      email:'sarah@uaecareer.ae',      role:'content_editor', status:'active',   lastLogin:'2026-06-13 14:22', createdAt:'2026-02-15', permissions:ROLE_PRESETS.content_editor.permissions },
  { id:3, name:'Mohammed Moderator', email:'mod@uaecareer.ae',        role:'job_moderator',  status:'active',   lastLogin:'2026-06-12 09:10', createdAt:'2026-03-01', permissions:ROLE_PRESETS.job_moderator.permissions  },
  { id:4, name:'Ana Analyst',        email:'analytics@uaecareer.ae',  role:'analyst',        status:'inactive', lastLogin:'2026-05-30 11:00', createdAt:'2026-04-10', permissions:ROLE_PRESETS.analyst.permissions        },
];

const STATUS_CFG: Record<AdminStatus, { label:string; cls:string }> = {
  active:    { label:'Active',    cls:'bg-emerald-100 text-emerald-700' },
  inactive:  { label:'Inactive',  cls:'bg-gray-100 text-gray-500'      },
  suspended: { label:'Suspended', cls:'bg-red-100 text-red-700'        },
};

const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]';

function PermissionMatrix({ permissions, onChange, readonly }: { permissions: Record<string,string[]>; onChange:(p:Record<string,string[]>)=>void; readonly?:boolean }) {
  const [expanded, setExpanded] = useState<Record<string,boolean>>(Object.fromEntries(PERMISSION_MODULES.map(m=>[m.module,true])));
  const has = (mod:string, act:string) => (permissions[mod]||[]).includes(act);
  const toggle = (mod:string, act:string) => {
    if (readonly) return;
    const curr = permissions[mod]||[];
    onChange({...permissions, [mod]: curr.includes(act) ? curr.filter(a=>a!==act) : [...curr,act]});
  };
  const toggleModule = (mod:string) => {
    if (readonly) return;
    const m = PERMISSION_MODULES.find(x=>x.module===mod)!;
    const keys = m.actions.map(a=>a.key);
    const allOn = keys.every(k=>has(mod,k));
    onChange({...permissions, [mod]: allOn ? [] : keys});
  };
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Module</span>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</span>
      </div>
      {PERMISSION_MODULES.map(mod => {
        const curr = permissions[mod.module]||[];
        const keys = mod.actions.map(a=>a.key);
        const allOn = keys.every(k=>curr.includes(k));
        const someOn = keys.some(k=>curr.includes(k));
        const open = expanded[mod.module];
        return (
          <div key={mod.module} className="border-b border-gray-100 last:border-0">
            <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50" onClick={()=>setExpanded(p=>({...p,[mod.module]:!p[mod.module]}))}>
              <div className="flex items-center gap-2.5">
                {!readonly && (
                  <input type="checkbox" checked={allOn} onClick={e=>e.stopPropagation()} onChange={()=>toggleModule(mod.module)} className="rounded"
                    ref={el=>{if(el) el.indeterminate=someOn&&!allOn;}} />
                )}
                <span>{mod.icon}</span>
                <span className="text-sm font-semibold text-gray-800 capitalize">{mod.module.replace('_',' ')}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${allOn?'bg-emerald-100 text-emerald-700':someOn?'bg-amber-100 text-amber-600':'bg-gray-100 text-gray-400'}`}>{curr.length}/{keys.length}</span>
              </div>
              {open ? <ChevronUp className="w-4 h-4 text-gray-400"/> : <ChevronDown className="w-4 h-4 text-gray-400"/>}
            </div>
            {open && (
              <div className="px-4 pb-3 flex flex-wrap gap-2 bg-gray-50/50">
                {mod.actions.map(action => {
                  const checked = has(mod.module,action.key);
                  return (
                    <button key={action.key} onClick={()=>toggle(mod.module,action.key)} type="button"
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${checked?'bg-[#1A3C6E] text-white border-[#1A3C6E]':'bg-white text-gray-600 border-gray-200 hover:border-[#1A3C6E]'} ${readonly?'cursor-default':''}`}>
                      {checked?'✓ ':'○ '}{action.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AdminUsersManagementPage() {
  const [admins, setAdmins]           = useState<AdminUser[]>(INITIAL_ADMINS);
  const [search, setSearch]           = useState('');
  const [roleFilter, setRoleFilter]   = useState('all');
  const [modal, setModal]             = useState<{mode:'add'|'edit'|'view';user?:AdminUser}|null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number|null>(null);
  const [fName,  setFName]   = useState('');
  const [fEmail, setFEmail]  = useState('');
  const [fPw,    setFPw]     = useState('');
  const [fRole,  setFRole]   = useState('content_editor');
  const [fStatus,setFStatus] = useState<AdminStatus>('active');
  const [fPerms, setFPerms]  = useState<Record<string,string[]>>(ROLE_PRESETS.content_editor.permissions);

  const openAdd = () => { setFName('');setFEmail('');setFPw('');setFRole('content_editor');setFStatus('active');setFPerms({...ROLE_PRESETS.content_editor.permissions});setModal({mode:'add'}); };
  const openEdit = (u:AdminUser) => { setFName(u.name);setFEmail(u.email);setFPw('');setFRole(u.role);setFStatus(u.status);setFPerms({...u.permissions});setModal({mode:'edit',user:u}); };
  const applyPreset = (k:string) => { setFRole(k); setFPerms({...ROLE_PRESETS[k].permissions}); };

  const saveAdmin = () => {
    if(!fName.trim()||!fEmail.trim()) return;
    if(modal?.mode==='add') {
      setAdmins(p=>[...p,{id:Date.now(),name:fName,email:fEmail,role:fRole,status:fStatus,lastLogin:'—',createdAt:new Date().toISOString().slice(0,10),permissions:fPerms}]);
    } else if(modal?.user) {
      setAdmins(p=>p.map(a=>a.id===modal.user!.id?{...a,name:fName,email:fEmail,role:fRole,status:fStatus,permissions:fPerms}:a));
    }
    setModal(null);
  };

  const filtered = admins.filter(a=>{
    const q=search.toLowerCase();
    return (a.name.toLowerCase().includes(q)||a.email.toLowerCase().includes(q))&&(roleFilter==='all'||a.role===roleFilter);
  });

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {label:'Total Admin Users',      value:admins.length,                                   color:'text-[#1A3C6E]',  bg:'bg-blue-50'},
          {label:'Active',                 value:admins.filter(a=>a.status==='active').length,    color:'text-emerald-700',bg:'bg-emerald-50'},
          {label:'Inactive / Suspended',   value:admins.filter(a=>a.status!=='active').length,   color:'text-amber-700',  bg:'bg-amber-50'},
          {label:'Permission Actions',     value:totalPermissions,                                color:'text-purple-700', bg:'bg-purple-50'},
        ].map(s=>(
          <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-white`}>
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Role legend */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Available Role Presets</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(ROLE_PRESETS).map(([k,r])=>(
            <div key={k} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${r.color}`}>
              {r.label} <span className="opacity-60">({countPerms(r.permissions)}/{totalPermissions})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Admin Users <span className="text-gray-400 font-normal text-sm">({filtered.length})</span></h3>
          <button onClick={openAdd} className="flex items-center gap-1.5 rounded-lg bg-[#FF6B35] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e55a24]">
            <Plus className="w-4 h-4"/> Add Admin User
          </button>
        </div>
        <div className="px-5 py-3 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <input type="text" placeholder="Search name or email…" value={search} onChange={e=>setSearch(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E] flex-1"/>
          <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]">
            <option value="all">All Roles</option>
            {Object.keys(ROLE_PRESETS).map(k=><option key={k} value={k}>{ROLE_PRESETS[k].label}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['User','Role','Permissions','Status','Last Login','Actions'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length===0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No admin users found.</td></tr>
              ) : filtered.map((admin,i)=>{
                const rp = ROLE_PRESETS[admin.role];
                const pc = countPerms(admin.permissions);
                return (
                  <tr key={admin.id} className={`border-b border-gray-50 hover:bg-blue-50/20 ${i%2===0?'':'bg-gray-50/30'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1A3C6E] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{admin.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <p className="font-semibold text-gray-800 leading-tight">{admin.name}</p>
                          <p className="text-xs text-gray-500">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${rp?.color??'bg-gray-100 text-gray-500'}`}>{rp?.label??admin.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-gray-200"><div className="h-1.5 rounded-full bg-[#1A3C6E]" style={{width:`${(pc/totalPermissions)*100}%`}}/></div>
                        <span className="text-xs text-gray-500">{pc}/{totalPermissions}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">{PERMISSION_MODULES.filter(m=>(admin.permissions[m.module]||[]).length>0).map(m=>m.icon).join(' ')}</p>
                    </td>
                    <td className="px-4 py-3"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CFG[admin.status].cls}`}>{STATUS_CFG[admin.status].label}</span></td>
                    <td className="px-4 py-3 text-xs text-gray-500">{admin.lastLogin}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={()=>setModal({mode:'view',user:admin})} title="View permissions" className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"><Eye className="w-3.5 h-3.5"/></button>
                        {!admin.isSuperAdmin && <>
                          <button onClick={()=>openEdit(admin)} title="Edit" className="p-1.5 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"><Edit2 className="w-3.5 h-3.5"/></button>
                          <button onClick={()=>setAdmins(p=>p.map(a=>a.id===admin.id?{...a,status:a.status==='active'?'inactive':'active'}:a))} title="Toggle status" className={`p-1.5 rounded ${admin.status==='active'?'bg-amber-100 text-amber-700 hover:bg-amber-200':'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}><Shield className="w-3.5 h-3.5"/></button>
                          <button onClick={()=>setDeleteConfirm(admin.id)} title="Delete" className="p-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200"><Trash2 className="w-3.5 h-3.5"/></button>
                        </>}
                        {admin.isSuperAdmin && <span className="text-[10px] text-[#b37e00] bg-[#FFB400]/10 px-2 py-0.5 rounded-full font-medium">Protected</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(modal?.mode==='add'||modal?.mode==='edit') && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-[#1A3C6E]">{modal.mode==='add'?'Add New Admin User':`Edit — ${modal.user?.name}`}</h2>
              <button onClick={()=>setModal(null)}><X className="w-5 h-5 text-gray-400 hover:text-gray-700"/></button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name *</label><input className={inp} value={fName} onChange={e=>setFName(e.target.value)} placeholder="Jane Admin"/></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Email Address *</label><input className={inp} type="email" value={fEmail} onChange={e=>setFEmail(e.target.value)} placeholder="jane@uaecareer.ae"/></div>
                {modal.mode==='add' && <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Temporary Password *</label><input className={inp} type="password" value={fPw} onChange={e=>setFPw(e.target.value)} placeholder="Min 8 characters"/></div>}
                <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
                  <select className={inp} value={fStatus} onChange={e=>setFStatus(e.target.value as AdminStatus)}>
                    <option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Start from Role Preset — then customise below</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(ROLE_PRESETS).filter(([k])=>k!=='super_admin').map(([k,r])=>(
                    <button key={k} onClick={()=>applyPreset(k)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${fRole===k?r.color+' border-transparent':'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                      {r.label} ({countPerms(r.permissions)})
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Permission Matrix — {countPerms(fPerms)}/{totalPermissions} granted</label>
                <PermissionMatrix permissions={fPerms} onChange={setFPerms}/>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={()=>setModal(null)} className="rounded-lg border border-gray-300 px-5 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={saveAdmin} disabled={!fName.trim()||!fEmail.trim()||(modal.mode==='add'&&!fPw)} className="rounded-lg bg-[#1A3C6E] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0d2444] disabled:opacity-40">
                {modal.mode==='add'?'Create Admin User':'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Permissions Modal */}
      {modal?.mode==='view' && modal.user && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div><h2 className="text-base font-bold text-[#1A3C6E]">{modal.user.name} — Permissions</h2>
                <p className="text-xs text-gray-500">{countPerms(modal.user.permissions)}/{totalPermissions} actions granted</p></div>
              <button onClick={()=>setModal(null)}><X className="w-5 h-5 text-gray-400 hover:text-gray-700"/></button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto"><PermissionMatrix permissions={modal.user.permissions} onChange={()=>{}} readonly/></div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={()=>setModal(null)} className="rounded-lg border border-gray-300 px-5 py-2 text-sm text-gray-600 hover:bg-gray-50">Close</button>
              {!modal.user.isSuperAdmin && <button onClick={()=>openEdit(modal.user!)} className="rounded-lg bg-[#1A3C6E] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0d2444]">Edit Permissions</button>}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm!==null && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Admin User?</h3>
            <p className="text-sm text-gray-500 mb-5">This removes all their access permanently.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={()=>setDeleteConfirm(null)} className="rounded-lg border border-gray-300 px-5 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={()=>{setAdmins(p=>p.filter(a=>a.id!==deleteConfirm));setDeleteConfirm(null);}} className="rounded-lg bg-red-600 text-white px-5 py-2 text-sm font-semibold hover:bg-red-700">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
