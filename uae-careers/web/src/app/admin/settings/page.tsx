'use client';

import { useState } from 'react';

// ── Tab types ──────────────────────────────────────────────────────────────────
type Tab =
  | 'general'
  | 'apply'
  | 'ads'
  | 'media'
  | 'approval'
  | 'employer'
  | 'premium'
  | 'payments'
  | 'llm';

const TABS: { id: Tab; label: string }[] = [
  { id: 'general',  label: 'General' },
  { id: 'apply',    label: 'Apply Methods' },
  { id: 'ads',      label: 'Ad Settings' },
  { id: 'media',    label: 'CV & Media' },
  { id: 'approval', label: 'User Approval' },
  { id: 'employer', label: 'Employer Limits' },
  { id: 'premium',  label: 'Premium' },
  { id: 'payments', label: 'Payments' },
  { id: 'llm',      label: 'LLM / AI' },
];

// ── Shared UI helpers ──────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-[#1A3C6E]' : 'bg-gray-300'}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 py-3 border-b border-gray-100 last:border-0">
      <div className="sm:w-56 shrink-0">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
    />
  );
}

function NumberInput({ value, onChange, min, max, suffix }: { value: number; onChange: (v: number) => void; min?: number; max?: number; suffix?: string }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
      />
      {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
    >
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

function SaveBar({ saving, onSave }: { saving: boolean; onSave: () => void }) {
  return (
    <div className="mt-6 flex justify-end">
      <button
        onClick={onSave}
        disabled={saving}
        className="rounded-lg bg-[#1A3C6E] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0d2444] disabled:opacity-50 transition-colors"
      >
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  );
}

// ── Category rows for apply method overrides ───────────────────────────────────
const CATEGORIES = ['IT', 'Marketing', 'Finance', 'HR', 'Sales', 'Engineering', 'Healthcare', 'Design'];
const APPLY_OPTIONS = ['Platform', 'Email', 'Phone', 'WhatsApp', 'External'];

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<Tab>('general');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<Tab | null>(null);

  // ── General ──────────────────────────────────────────────────────────────────
  const [siteName, setSiteName] = useState('UAE Careers');
  const [fraudNotice, setFraudNotice] = useState('UAE Careers never asks for money. Beware of fraudulent job offers.');
  const [fraudEmail, setFraudEmail] = useState('fraud@uaecareers.com');
  const [freePreviewCount, setFreePreviewCount] = useState(5);

  // ── Apply methods ─────────────────────────────────────────────────────────────
  const [globalApply, setGlobalApply] = useState('Platform');
  const [catOverrides, setCatOverrides] = useState<Record<string, string>>({});

  // ── Ads ───────────────────────────────────────────────────────────────────────
  const [landingAdType, setLandingAdType] = useState('Banner');
  const [rewardedEnabled, setRewardedEnabled] = useState(true);
  const [closeTimer, setCloseTimer] = useState(5);
  const [adsenseJobSlot, setAdsenseJobSlot] = useState('ca-pub-XXXX/slot-1');
  const [adsenseLandingSlot, setAdsenseLandingSlot] = useState('ca-pub-XXXX/slot-2');

  // ── CV & Media ────────────────────────────────────────────────────────────────
  const [cvUpload, setCvUpload] = useState(true);
  const [photoUpload, setPhotoUpload] = useState(true);
  const [maxCvSize, setMaxCvSize] = useState(5);
  const [maxPhotoSize, setMaxPhotoSize] = useState(2);
  const [storageProvider, setStorageProvider] = useState('S3');

  // ── Approval ──────────────────────────────────────────────────────────────────
  const [seekerApproval, setSeekerApproval] = useState('Auto');
  const [employerApproval, setEmployerApproval] = useState('Manual');

  // ── Employer limits ───────────────────────────────────────────────────────────
  const [freePostsLimit, setFreePostsLimit] = useState(3);
  const [additionalPostPrice, setAdditionalPostPrice] = useState(50);
  const [additionalPostCurrency, setAdditionalPostCurrency] = useState('AED');

  // ── Premium ───────────────────────────────────────────────────────────────────
  const [premiumEnabled, setPremiumEnabled] = useState(true);
  const [freeJobViewLimit, setFreeJobViewLimit] = useState(10);
  const [premiumPrice, setPremiumPrice] = useState(99);

  // ── Payments ──────────────────────────────────────────────────────────────────
  const [stripeEnabled, setStripeEnabled] = useState(true);
  const [stripeKey, setStripeKey] = useState('sk_live_...');
  const [paypalEnabled, setPaypalEnabled] = useState(false);
  const [paypalClientId, setPaypalClientId] = useState('');
  const [paypalSecret, setPaypalSecret] = useState('');

  // ── LLM ───────────────────────────────────────────────────────────────────────
  const [llmEnabled, setLlmEnabled] = useState(true);
  const [llmProvider, setLlmProvider] = useState('OpenAI');
  const [llmApiKey, setLlmApiKey] = useState('sk-...');
  const [employerLlmEnabled, setEmployerLlmEnabled] = useState(true);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(tab);
      setTimeout(() => setSaved(null), 2500);
    }, 700);
  };

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1.5 flex flex-wrap gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              tab === t.id
                ? 'bg-[#1A3C6E] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {saved === tab && (
          <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm text-emerald-700 font-medium">
            Settings saved successfully.
          </div>
        )}

        {/* ── General ── */}
        {tab === 'general' && (
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-4">General Settings</h3>
            <Field label="Site Name" hint="Displayed in browser tab and emails.">
              <TextInput value={siteName} onChange={setSiteName} placeholder="UAE Careers" />
            </Field>
            <Field label="Fraud Notice Text" hint="Shown on all pages as a safety banner.">
              <textarea
                value={fraudNotice}
                onChange={(e) => setFraudNotice(e.target.value)}
                rows={3}
                className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E] resize-none"
              />
            </Field>
            <Field label="Fraud Report Email" hint="Where fraud reports are sent.">
              <TextInput value={fraudEmail} onChange={setFraudEmail} type="email" placeholder="fraud@uaecareers.com" />
            </Field>
            <Field label="Free Job Preview Count" hint="How many jobs a visitor can view before seeing an ad gate.">
              <NumberInput value={freePreviewCount} onChange={setFreePreviewCount} min={1} max={100} suffix="jobs" />
            </Field>
            <SaveBar saving={saving} onSave={handleSave} />
          </div>
        )}

        {/* ── Apply Methods ── */}
        {tab === 'apply' && (
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-4">Apply Methods</h3>
            <Field label="Global Default" hint="Used when no category override is set.">
              <Select value={globalApply} onChange={setGlobalApply} options={APPLY_OPTIONS} />
            </Field>
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Per-Category Overrides</p>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Apply Method</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Override</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CATEGORIES.map((cat, i) => (
                      <tr key={cat} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="px-4 py-2.5 font-medium text-gray-700">{cat}</td>
                        <td className="px-4 py-2.5">
                          <select
                            value={catOverrides[cat] ?? globalApply}
                            onChange={(e) => setCatOverrides((prev) => ({ ...prev, [cat]: e.target.value }))}
                            className="rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#1A3C6E]"
                          >
                            {APPLY_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-2.5">
                          {catOverrides[cat] && catOverrides[cat] !== globalApply ? (
                            <button
                              onClick={() => setCatOverrides((prev) => { const n = { ...prev }; delete n[cat]; return n; })}
                              className="text-xs text-red-500 hover:underline"
                            >
                              Reset to global
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Using global</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <SaveBar saving={saving} onSave={handleSave} />
          </div>
        )}

        {/* ── Ads ── */}
        {tab === 'ads' && (
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-4">Ad Settings</h3>
            <Field label="Landing Page Ad Type" hint="Type of ad displayed on the homepage.">
              <Select value={landingAdType} onChange={setLandingAdType} options={['None', 'Banner', 'Interstitial', 'Rewarded']} />
            </Field>
            <Field label="Rewarded Ads" hint="Show a rewarded ad gate after free view limit.">
              <Toggle value={rewardedEnabled} onChange={setRewardedEnabled} />
            </Field>
            <Field label="Close Button Timer" hint="Seconds before user can close the rewarded ad.">
              <NumberInput value={closeTimer} onChange={setCloseTimer} min={0} max={60} suffix="seconds" />
            </Field>
            <Field label="AdSense Job Listing Slot" hint="AdSense ad slot ID for job listing pages.">
              <TextInput value={adsenseJobSlot} onChange={setAdsenseJobSlot} placeholder="ca-pub-XXXX/slot-1" />
            </Field>
            <Field label="AdSense Landing Page Slot" hint="AdSense ad slot ID for the homepage.">
              <TextInput value={adsenseLandingSlot} onChange={setAdsenseLandingSlot} placeholder="ca-pub-XXXX/slot-2" />
            </Field>
            <SaveBar saving={saving} onSave={handleSave} />
          </div>
        )}

        {/* ── CV & Media ── */}
        {tab === 'media' && (
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-4">CV & Media Settings</h3>
            <Field label="CV Upload" hint="Allow job seekers to upload a CV/resume.">
              <Toggle value={cvUpload} onChange={setCvUpload} />
            </Field>
            <Field label="Photo Upload" hint="Allow job seekers to upload a profile photo.">
              <Toggle value={photoUpload} onChange={setPhotoUpload} />
            </Field>
            <Field label="Max CV File Size" hint="Maximum allowed CV file size.">
              <NumberInput value={maxCvSize} onChange={setMaxCvSize} min={1} max={50} suffix="MB" />
            </Field>
            <Field label="Max Photo File Size" hint="Maximum allowed photo file size.">
              <NumberInput value={maxPhotoSize} onChange={setMaxPhotoSize} min={1} max={10} suffix="MB" />
            </Field>
            <Field label="Storage Provider" hint="Where uploads are stored.">
              <Select value={storageProvider} onChange={setStorageProvider} options={['S3', 'GCS', 'Azure Blob', 'Local']} />
            </Field>
            <SaveBar saving={saving} onSave={handleSave} />
          </div>
        )}

        {/* ── User Approval ── */}
        {tab === 'approval' && (
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-4">User Approval Settings</h3>
            <Field label="Job Seeker Approval" hint="Auto: approved immediately. Manual: requires admin review.">
              <div className="flex gap-3">
                {['Auto', 'Manual'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSeekerApproval(opt)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium border transition-colors ${
                      seekerApproval === opt
                        ? 'bg-[#1A3C6E] border-[#1A3C6E] text-white'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Employer Approval" hint="Auto: approved immediately. Manual: requires admin review.">
              <div className="flex gap-3">
                {['Auto', 'Manual'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setEmployerApproval(opt)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium border transition-colors ${
                      employerApproval === opt
                        ? 'bg-[#1A3C6E] border-[#1A3C6E] text-white'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </Field>
            <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700">
              <strong>Manual mode</strong> requires an admin to approve each registration. This adds friction but reduces spam accounts.
            </div>
            <SaveBar saving={saving} onSave={handleSave} />
          </div>
        )}

        {/* ── Employer Limits ── */}
        {tab === 'employer' && (
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-4">Employer Limits & Pricing</h3>
            <Field label="Free Job Posts Limit" hint="Number of free job posts each employer gets.">
              <NumberInput value={freePostsLimit} onChange={setFreePostsLimit} min={0} max={100} suffix="posts" />
            </Field>
            <Field label="Additional Post Price" hint="Price per post beyond the free limit.">
              <div className="flex items-center gap-2">
                <NumberInput value={additionalPostPrice} onChange={setAdditionalPostPrice} min={0} />
                <Select value={additionalPostCurrency} onChange={setAdditionalPostCurrency} options={['AED', 'USD', 'SAR', 'QAR']} />
              </div>
            </Field>
            <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-xs text-blue-700">
              Employers get <strong>{freePostsLimit}</strong> free posts. Additional posts cost <strong>{additionalPostCurrency} {additionalPostPrice}</strong> each.
            </div>
            <SaveBar saving={saving} onSave={handleSave} />
          </div>
        )}

        {/* ── Premium ── */}
        {tab === 'premium' && (
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-4">Premium Gate Settings</h3>
            <Field label="Premium Gate" hint="Require premium subscription after free view limit.">
              <Toggle value={premiumEnabled} onChange={setPremiumEnabled} />
            </Field>
            <Field label="Free Job View Limit" hint="How many jobs a visitor can view before hitting the premium gate.">
              <NumberInput value={freeJobViewLimit} onChange={setFreeJobViewLimit} min={1} max={1000} suffix="jobs" />
            </Field>
            <Field label="Premium Price" hint="Monthly subscription price in AED.">
              <NumberInput value={premiumPrice} onChange={setPremiumPrice} min={0} suffix="AED / month" />
            </Field>
            {!premiumEnabled && (
              <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-500">
                Premium gate is disabled. All users can browse unlimited jobs for free.
              </div>
            )}
            <SaveBar saving={saving} onSave={handleSave} />
          </div>
        )}

        {/* ── Payments ── */}
        {tab === 'payments' && (
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-4">Payment Gateway Settings</h3>
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Stripe</p>
              <div className="rounded-xl border border-gray-100 p-4 space-y-0">
                <Field label="Stripe Enabled">
                  <Toggle value={stripeEnabled} onChange={setStripeEnabled} />
                </Field>
                {stripeEnabled && (
                  <Field label="Stripe Secret Key" hint="Server-side secret key. Never expose publicly.">
                    <TextInput value={stripeKey} onChange={setStripeKey} type="password" placeholder="sk_live_..." />
                  </Field>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">PayPal</p>
              <div className="rounded-xl border border-gray-100 p-4 space-y-0">
                <Field label="PayPal Enabled">
                  <Toggle value={paypalEnabled} onChange={setPaypalEnabled} />
                </Field>
                {paypalEnabled && (
                  <>
                    <Field label="Client ID">
                      <TextInput value={paypalClientId} onChange={setPaypalClientId} placeholder="AXxx..." />
                    </Field>
                    <Field label="Secret" hint="PayPal secret key.">
                      <TextInput value={paypalSecret} onChange={setPaypalSecret} type="password" placeholder="EXxx..." />
                    </Field>
                  </>
                )}
              </div>
            </div>
            <SaveBar saving={saving} onSave={handleSave} />
          </div>
        )}

        {/* ── LLM / AI ── */}
        {tab === 'llm' && (
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-4">LLM / AI Settings</h3>
            <Field label="AI Features Enabled" hint="Master toggle for all AI-powered features.">
              <Toggle value={llmEnabled} onChange={setLlmEnabled} />
            </Field>
            {llmEnabled && (
              <>
                <Field label="LLM Provider" hint="Which AI provider to use for smart features.">
                  <Select value={llmProvider} onChange={setLlmProvider} options={['OpenAI', 'Anthropic Claude', 'Google Gemini', 'Mistral', 'Local (Ollama)']} />
                </Field>
                <Field label="API Key" hint="Provider API key. Stored securely server-side.">
                  <TextInput value={llmApiKey} onChange={setLlmApiKey} type="password" placeholder="sk-..." />
                </Field>
                <Field label="Employer AI Mode" hint="Allow employers to use AI to write and optimize job listings.">
                  <Toggle value={employerLlmEnabled} onChange={setEmployerLlmEnabled} />
                </Field>
              </>
            )}
            {!llmEnabled && (
              <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-500">
                AI features are disabled. Smart job matching, auto-summaries, and employer AI tools will not be available.
              </div>
            )}
            <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-xs text-blue-700">
              <strong>Privacy note:</strong> Job seeker data is never sent to third-party AI providers without explicit consent.
            </div>
            <SaveBar saving={saving} onSave={handleSave} />
          </div>
        )}
      </div>
    </div>
  );
}
