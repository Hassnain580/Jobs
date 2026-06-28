'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Check, Loader2, AlertTriangle, Eye } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { cn, formatSalary } from '@/lib/utils';

type Step1Form = {
  title: string;
  category: string;
  country: string;
  city: string;
  job_type: string;
  experience: string;
  salary_min?: string;
  salary_max?: string;
  salary_currency?: string;
};

type Step2Form = {
  description: string;
  responsibilities?: string;
  requirements?: string;
  important_note?: string;
};

type Step3Form = {
  apply_method: 'email' | 'url' | 'whatsapp' | 'walkin';
  apply_email?: string;
  apply_url?: string;
  apply_whatsapp?: string;
};

const STEPS = ['Basic Info', 'Job Details', 'Apply Settings', 'Preview & Submit'];

const COUNTRIES = ['UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Oman', 'Bahrain'];
const CATEGORIES = ['IT & Technology', 'Engineering', 'Accounting & Finance', 'Medical & Healthcare', 'Sales & Marketing', 'HR & Administration', 'Construction', 'Hospitality & Tourism'];
const JOB_TYPES = [{ value: 'full_time', label: 'Full Time' }, { value: 'part_time', label: 'Part Time' }, { value: 'contract', label: 'Contract' }, { value: 'internship', label: 'Internship' }, { value: 'freelance', label: 'Freelance' }];
const EXPERIENCE_LEVELS = ['Entry Level (0-1 yr)', '1-3 Years', '3-5 Years', '5-10 Years', '10+ Years'];

const MOCK_EMPLOYER = { first_name: 'Sarah', last_name: 'Al Hassan', role: 'employer' as const };

export default function PostJobPage() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Form data accumulated across steps
  const [formData, setFormData] = useState<Partial<Step1Form & Step2Form & Step3Form>>({
    salary_currency: 'AED',
    apply_method: 'email',
  });

  const step1Form = useForm<Step1Form>({
    defaultValues: formData,
  });

  const step2Form = useForm<Step2Form>({
    defaultValues: formData,
  });

  const step3Form = useForm<Step3Form>({
    defaultValues: { apply_method: 'email', ...formData },
  });

  const applyMethod = step3Form.watch('apply_method');
  const importantNote = step2Form.watch('important_note') ?? '';

  async function onStep1Submit(data: Step1Form) {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(1);
  }

  async function onStep2Submit(data: Step2Form) {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(2);
  }

  async function onStep3Submit(data: Step3Form) {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(3);
  }

  async function onFinalSubmit() {
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      router.push('/employer/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header user={MOCK_EMPLOYER} />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
            <p className="text-gray-500 text-sm mt-1">Fill in the details to attract the right candidates.</p>
          </div>

          {/* Stepper */}
          <div className="flex items-center mb-8">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                      i < step ? 'bg-[#1A3C6E] text-white' :
                      i === step ? 'bg-[#FF6B35] text-white' :
                      'bg-gray-200 text-gray-500'
                    )}
                  >
                    {i < step ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={cn('text-xs mt-1 font-medium hidden sm:block', i === step ? 'text-[#FF6B35]' : 'text-gray-500')}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn('flex-1 h-0.5 mx-2', i < step ? 'bg-[#1A3C6E]' : 'bg-gray-200')} />
                )}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
            {/* Step 1: Basic Info */}
            {step === 0 && (
              <form onSubmit={step1Form.handleSubmit(onStep1Submit)} className="space-y-5">
                <h2 className="text-lg font-bold text-gray-900 mb-5">Basic Information</h2>

                <FormField label="Job Title *" error={step1Form.formState.errors.title?.message}>
                  <input {...step1Form.register('title', { required: 'Job title is required', minLength: { value: 5, message: 'At least 5 characters' } })} placeholder="e.g. Senior Software Engineer" className="form-input" />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Category *" error={step1Form.formState.errors.category?.message}>
                    <select {...step1Form.register('category')} className="form-input">
                      <option value="">Select category</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Job Type *" error={step1Form.formState.errors.job_type?.message}>
                    <select {...step1Form.register('job_type')} className="form-input">
                      <option value="">Select type</option>
                      {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Country *" error={step1Form.formState.errors.country?.message}>
                    <select {...step1Form.register('country')} className="form-input">
                      <option value="">Select country</option>
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </FormField>
                  <FormField label="City *" error={step1Form.formState.errors.city?.message}>
                    <input {...step1Form.register('city')} placeholder="e.g. Dubai" className="form-input" />
                  </FormField>
                </div>

                <FormField label="Experience Level *" error={step1Form.formState.errors.experience?.message}>
                  <select {...step1Form.register('experience')} className="form-input">
                    <option value="">Select level</option>
                    {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </FormField>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Salary Range (AED/month) — optional</label>
                  <div className="flex gap-3 items-center">
                    <input {...step1Form.register('salary_min')} type="number" placeholder="Min (e.g. 8000)" className="form-input flex-1" />
                    <span className="text-gray-400 flex-shrink-0">–</span>
                    <input {...step1Form.register('salary_max')} type="number" placeholder="Max (e.g. 15000)" className="form-input flex-1" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Leave blank to show &quot;Not disclosed&quot;</p>
                </div>

                <StepNav canBack={false} onBack={() => {}} isSubmitting={false} isLastStep={false} />
              </form>
            )}

            {/* Step 2: Details */}
            {step === 1 && (
              <form onSubmit={step2Form.handleSubmit(onStep2Submit)} className="space-y-5">
                <h2 className="text-lg font-bold text-gray-900 mb-5">Job Details</h2>

                <FormField label="Job Description *" error={step2Form.formState.errors.description?.message}>
                  <textarea
                    {...step2Form.register('description', { required: 'Description is required', minLength: { value: 100, message: 'At least 100 characters' } })}
                    rows={7}
                    placeholder="Describe the role, company culture, and what makes it exciting..."
                    className="form-input resize-y"
                  />
                </FormField>

                <FormField label="Responsibilities" error={step2Form.formState.errors.responsibilities?.message}>
                  <textarea
                    {...step2Form.register('responsibilities')}
                    rows={5}
                    placeholder="• List key responsibilities&#10;• Use bullet points for clarity"
                    className="form-input resize-y"
                  />
                </FormField>

                <FormField label="Requirements" error={step2Form.formState.errors.requirements?.message}>
                  <textarea
                    {...step2Form.register('requirements')}
                    rows={5}
                    placeholder="• Minimum qualifications&#10;• Required skills and experience"
                    className="form-input resize-y"
                  />
                </FormField>

                {/* Important note with character counter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Important Note
                    <span className="ml-1 text-xs font-normal text-gray-400">(walk-in details, visa, location, etc.)</span>
                  </label>
                  <div className="relative">
                    <AlertTriangle className="absolute left-3 top-3 w-4 h-4 text-amber-500" />
                    <textarea
                      {...step2Form.register('important_note')}
                      rows={3}
                      maxLength={500}
                      placeholder="e.g. Walk-in interview every Tuesday 10AM–1PM at our HQ. Bring CV and certificates."
                      className="form-input pl-9 resize-y border-amber-200 focus:ring-amber-400"
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    {step2Form.formState.errors.important_note && (
                      <p className="text-xs text-red-500">{step2Form.formState.errors.important_note.message}</p>
                    )}
                    <p className={cn('text-xs ml-auto', importantNote.length > 450 ? 'text-red-500' : 'text-gray-400')}>
                      {importantNote.length}/500
                    </p>
                  </div>
                </div>

                <StepNav canBack onBack={() => setStep(0)} isSubmitting={false} isLastStep={false} />
              </form>
            )}

            {/* Step 3: Apply Settings */}
            {step === 2 && (
              <form onSubmit={step3Form.handleSubmit(onStep3Submit)} className="space-y-5">
                <h2 className="text-lg font-bold text-gray-900 mb-5">Apply Settings</h2>
                <p className="text-sm text-gray-600">How should candidates apply for this job?</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { value: 'email', label: '📧 Email' },
                    { value: 'url', label: '🌐 Website' },
                    { value: 'whatsapp', label: '💬 WhatsApp' },
                    { value: 'walkin', label: '🚶 Walk-in' },
                  ].map(({ value, label }) => (
                    <label
                      key={value}
                      className={cn(
                        'flex flex-col items-center gap-1 p-3 rounded-xl border-2 cursor-pointer text-sm font-medium transition-colors',
                        applyMethod === value
                          ? 'border-[#1A3C6E] bg-blue-50 text-[#1A3C6E]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      )}
                    >
                      <input
                        type="radio"
                        value={value}
                        {...step3Form.register('apply_method')}
                        className="sr-only"
                      />
                      {label}
                    </label>
                  ))}
                </div>

                {applyMethod === 'email' && (
                  <FormField label="Application email address *" error={step3Form.formState.errors.apply_email?.message}>
                    <input type="email" {...step3Form.register('apply_email')} placeholder="hr@yourcompany.com" className="form-input" />
                  </FormField>
                )}
                {applyMethod === 'url' && (
                  <FormField label="Application URL *" error={step3Form.formState.errors.apply_url?.message}>
                    <input type="url" {...step3Form.register('apply_url')} placeholder="https://yourcompany.com/apply/..." className="form-input" />
                  </FormField>
                )}
                {applyMethod === 'whatsapp' && (
                  <FormField label="WhatsApp number (with country code) *" error={step3Form.formState.errors.apply_whatsapp?.message}>
                    <input {...step3Form.register('apply_whatsapp')} placeholder="+971501234567" className="form-input" />
                  </FormField>
                )}
                {applyMethod === 'walkin' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    Walk-in details should be added in the &quot;Important Note&quot; field in Step 2. Make sure you included the venue, date, and time.
                  </div>
                )}

                <StepNav canBack onBack={() => setStep(1)} isSubmitting={false} isLastStep={false} />
              </form>
            )}

            {/* Step 4: Preview */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-5">
                  <Eye className="w-5 h-5 text-[#1A3C6E]" />
                  <h2 className="text-lg font-bold text-gray-900">Preview & Submit</h2>
                </div>

                <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-3 text-sm">
                  <PreviewRow label="Job Title" value={formData.title} />
                  <PreviewRow label="Category" value={formData.category} />
                  <PreviewRow label="Location" value={`${formData.city}, ${formData.country}`} />
                  <PreviewRow label="Job Type" value={formData.job_type?.replace('_', ' ')} />
                  <PreviewRow label="Experience" value={formData.experience} />
                  <PreviewRow
                    label="Salary"
                    value={formatSalary(
                      formData.salary_min ? Number(formData.salary_min) : undefined,
                      formData.salary_max ? Number(formData.salary_max) : undefined,
                      formData.salary_currency
                    )}
                  />
                  <PreviewRow label="Apply via" value={formData.apply_method} />
                  {formData.important_note && (
                    <div>
                      <span className="font-semibold text-gray-500 block mb-1">Important Note</span>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800">
                        {formData.important_note}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                  Your job will be reviewed and published within 2–4 hours. You&apos;ll receive an email confirmation.
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={onFinalSubmit}
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#FF6B35] hover:bg-[#e55a24] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Submit Job Listing
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function StepNav({ canBack, onBack, isSubmitting, isLastStep }: {
  canBack: boolean;
  onBack: () => void;
  isSubmitting: boolean;
  isLastStep: boolean;
}) {
  return (
    <div className="flex items-center gap-3 pt-4">
      {canBack && (
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="ml-auto flex items-center gap-2 bg-[#1A3C6E] hover:bg-[#0d2444] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {isLastStep ? 'Submit' : 'Continue'}
        {!isLastStep && <ChevronRight className="w-4 h-4" />}
      </button>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-3">
      <span className="w-32 flex-shrink-0 font-semibold text-gray-500">{label}</span>
      <span className="text-gray-900 capitalize">{value ?? '—'}</span>
    </div>
  );
}
