'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminProfilePage() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('Super Admin');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState('');

  // ── Form state ──────────────────────────────────────────────────────────────
  const [displayName, setDisplayName] = useState('Super Admin');
  const [email,       setEmail]       = useState('admin@uaecareer.ae');

  // Password change
  const [currentPw,  setCurrentPw]  = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [confirmPw,  setConfirmPw]  = useState('');
  const [pwError,    setPwError]    = useState('');
  const [showPw,     setShowPw]     = useState(false);

  useEffect(() => {
    const name = localStorage.getItem('admin_name') || 'Super Admin';
    setAdminName(name);
    setDisplayName(name);
  }, []);

  const saveProfile = () => {
    if (!displayName.trim() || !email.trim()) return;
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem('admin_name', displayName);
      setSaving(false);
      setSaved('profile');
      setTimeout(() => setSaved(''), 2500);
    }, 600);
  };

  const savePassword = () => {
    setPwError('');
    if (!currentPw) { setPwError('Enter your current password.'); return; }
    if (currentPw !== 'Applesec22@u') { setPwError('Current password is incorrect.'); return; }
    if (newPw.length < 8) { setPwError('New password must be at least 8 characters.'); return; }
    if (!/[A-Z]/.test(newPw)) { setPwError('New password must contain at least one uppercase letter.'); return; }
    if (!/[0-9]/.test(newPw)) { setPwError('New password must contain at least one number.'); return; }
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return; }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved('password');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setTimeout(() => setSaved(''), 2500);
    }, 700);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_name');
    router.replace('/secure-portal-9x4m7k');
  };

  const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]';

  const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#1A3C6E]">My Profile</h1>
        <p className="text-xs text-gray-500 mt-0.5">Manage your admin account settings</p>
      </div>

      {/* Avatar + role */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-[#1A3C6E] text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900">{adminName}</p>
          <span className="inline-flex items-center gap-1.5 bg-[#FFB400]/20 text-[#b37e00] text-xs font-semibold px-2.5 py-1 rounded-full mt-1">
            🔐 Super Admin
          </span>
        </div>
        <button onClick={handleLogout} className="ml-auto rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors">
          Logout
        </button>
      </div>

      {/* Profile info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Profile Information</h2>
          {saved === 'profile' && <span className="text-emerald-600 text-sm font-medium">✓ Saved</span>}
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Name</label>
            <input className={inp} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your Name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input className={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@uaecareer.ae" />
            <p className="text-xs text-gray-400 mt-1">Email is used for login. Changes take effect on next login.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
            <input className={`${inp} bg-gray-50 cursor-not-allowed`} value="Super Admin" disabled />
          </div>
          <button onClick={saveProfile} disabled={saving} className="rounded-lg bg-[#1A3C6E] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0d2444] disabled:opacity-50 transition-colors">
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Change Password</h2>
          {saved === 'password' && <span className="text-emerald-600 text-sm font-medium">✓ Password updated</span>}
        </div>
        <div className="p-6 space-y-4">
          {pwError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{pwError}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
            <input className={inp} type={showPw ? 'text' : 'password'} value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
            <input className={inp} type={showPw ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min 8 chars, 1 uppercase, 1 number" />
            {/* Password strength */}
            {newPw && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[newPw.length >= 8, /[A-Z]/.test(newPw), /[0-9]/.test(newPw), /[^A-Za-z0-9]/.test(newPw)].map((ok, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${ok ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {[newPw.length >= 8, /[A-Z]/.test(newPw), /[0-9]/.test(newPw), /[^A-Za-z0-9]/.test(newPw)].filter(Boolean).length < 2 ? 'Weak' :
                   [newPw.length >= 8, /[A-Z]/.test(newPw), /[0-9]/.test(newPw), /[^A-Za-z0-9]/.test(newPw)].filter(Boolean).length < 4 ? 'Good' : 'Strong'} password
                </p>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
            <input className={inp} type={showPw ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••" />
            {confirmPw && newPw !== confirmPw && <p className="text-xs text-red-500 mt-1">Passwords do not match</p>}
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={showPw} onChange={e => setShowPw(e.target.checked)} className="rounded" />
            Show passwords
          </label>
          <button onClick={savePassword} disabled={saving} className="rounded-lg bg-[#FF6B35] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#e55a24] disabled:opacity-50 transition-colors">
            {saving ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm">
        <div className="px-6 py-4 border-b border-red-100">
          <h2 className="font-semibold text-red-700">Danger Zone</h2>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">Sign out of all sessions</p>
            <p className="text-xs text-gray-500">Clears all stored tokens on this device</p>
          </div>
          <button onClick={handleLogout} className="rounded-lg border border-red-300 text-red-600 px-4 py-2 text-sm font-medium hover:bg-red-50 transition-colors">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
