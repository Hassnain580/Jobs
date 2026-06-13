'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Briefcase, Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const seekerSchema = z.object({
  first_name: z.string().min(2, 'First name is required'),
  last_name: z.string().min(2, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  terms: z.literal(true, 'You must accept the terms'),
});

const employerSchema = z.object({
  company_name: z.string().min(2, 'Company name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  terms: z.literal(true, 'You must accept the terms'),
});

type SeekerForm = z.infer<typeof seekerSchema>;
type EmployerForm = z.infer<typeof employerSchema>;

export default function RegisterPage() {
  const [role, setRole] = useState<'seeker' | 'employer'>('seeker');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const seekerForm = useForm<SeekerForm>({ resolver: zodResolver(seekerSchema) });
  const employerForm = useForm<EmployerForm>({ resolver: zodResolver(employerSchema) });

  async function onSeekerSubmit(data: SeekerForm) {
    setIsLoading(true);
    try {
      console.log('Seeker register', data);
      await new Promise((r) => setTimeout(r, 1000));
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  }

  async function onEmployerSubmit(data: EmployerForm) {
    setIsLoading(true);
    try {
      console.log('Employer register', data);
      await new Promise((r) => setTimeout(r, 1000));
      router.push('/employer/dashboard');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-[#FF6B35]" />
            <span className="text-2xl font-bold text-[#1A3C6E]">UAE Careers</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Join thousands of Gulf professionals</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Role toggle */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            {(['seeker', 'employer'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={cn(
                  'flex-1 text-sm font-medium py-2 rounded-lg transition-colors',
                  role === r
                    ? 'bg-white text-[#1A3C6E] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {r === 'seeker' ? '🔍 Job Seeker' : '🏢 Employer'}
              </button>
            ))}
          </div>

          {/* Job Seeker form */}
          {role === 'seeker' && (
            <form onSubmit={seekerForm.handleSubmit(onSeekerSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
                  <input
                    type="text"
                    placeholder="Ahmed"
                    {...seekerForm.register('first_name')}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
                  />
                  {seekerForm.formState.errors.first_name && (
                    <p className="text-xs text-red-500 mt-1">{seekerForm.formState.errors.first_name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
                  <input
                    type="text"
                    placeholder="Al Mansouri"
                    {...seekerForm.register('last_name')}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
                  />
                  {seekerForm.formState.errors.last_name && (
                    <p className="text-xs text-red-500 mt-1">{seekerForm.formState.errors.last_name.message}</p>
                  )}
                </div>
              </div>
              <FormField label="Email address" error={seekerForm.formState.errors.email?.message}>
                <input type="email" placeholder="you@example.com" {...seekerForm.register('email')} className="form-input" />
              </FormField>
              <FormField label="Phone number" error={seekerForm.formState.errors.phone?.message}>
                <input type="tel" placeholder="+971 50 123 4567" {...seekerForm.register('phone')} className="form-input" />
              </FormField>
              <PasswordField
                label="Password"
                show={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
                registration={seekerForm.register('password')}
                error={seekerForm.formState.errors.password?.message}
              />
              <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" {...seekerForm.register('terms')} className="mt-0.5 w-4 h-4 accent-[#1A3C6E]" />
                <span>
                  I agree to the{' '}
                  <Link href="/terms" className="text-[#FF6B35] hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-[#FF6B35] hover:underline">Privacy Policy</Link>
                </span>
              </label>
              {seekerForm.formState.errors.terms && (
                <p className="text-xs text-red-500">{seekerForm.formState.errors.terms.message}</p>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#FF6B35] hover:bg-[#e55a24] text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Seeker Account
              </button>
            </form>
          )}

          {/* Employer form */}
          {role === 'employer' && (
            <form onSubmit={employerForm.handleSubmit(onEmployerSubmit)} className="space-y-4">
              <FormField label="Company name" error={employerForm.formState.errors.company_name?.message}>
                <input type="text" placeholder="Emirates Group" {...employerForm.register('company_name')} className="form-input" />
              </FormField>
              <FormField label="Work email" error={employerForm.formState.errors.email?.message}>
                <input type="email" placeholder="hr@company.com" {...employerForm.register('email')} className="form-input" />
              </FormField>
              <FormField label="Phone number" error={employerForm.formState.errors.phone?.message}>
                <input type="tel" placeholder="+971 4 123 4567" {...employerForm.register('phone')} className="form-input" />
              </FormField>
              <PasswordField
                label="Password"
                show={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
                registration={employerForm.register('password')}
                error={employerForm.formState.errors.password?.message}
              />
              <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" {...employerForm.register('terms')} className="mt-0.5 w-4 h-4 accent-[#1A3C6E]" />
                <span>
                  I agree to the{' '}
                  <Link href="/terms" className="text-[#FF6B35] hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-[#FF6B35] hover:underline">Privacy Policy</Link>
                </span>
              </label>
              {employerForm.formState.errors.terms && (
                <p className="text-xs text-red-500">{employerForm.formState.errors.terms.message}</p>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1A3C6E] hover:bg-[#0d2444] text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Employer Account
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-xs text-gray-400">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button type="button" className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4 text-[#0A66C2] fill-current" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#FF6B35] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
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

function PasswordField({
  label, show, onToggle, registration, error,
}: {
  label: string;
  show: boolean;
  onToggle: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registration: any;
  error?: string;
}) {
  return (
    <FormField label={label} error={error}>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          placeholder="••••••••"
          {...registration}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
        />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </FormField>
  );
}
