'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Briefcase, Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const emailSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const otpPhoneSchema = z.object({
  phone: z.string().min(7, 'Enter a valid phone number'),
});

const otpCodeSchema = z.object({
  code: z.string().length(6, 'Enter the 6-digit code'),
});

type EmailForm = z.infer<typeof emailSchema>;
type OtpPhoneForm = z.infer<typeof otpPhoneSchema>;
type OtpCodeForm = z.infer<typeof otpCodeSchema>;

export default function LoginPage() {
  const [tab, setTab] = useState<'email' | 'otp'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [otpStep, setOtpStep] = useState<'phone' | 'code'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
  const phoneForm = useForm<OtpPhoneForm>({ resolver: zodResolver(otpPhoneSchema) });
  const codeForm = useForm<OtpCodeForm>({ resolver: zodResolver(otpCodeSchema) });

  async function onEmailSubmit(data: EmailForm) {
    setIsLoading(true);
    try {
      // Replace with real API call
      console.log('Email login', data);
      await new Promise((r) => setTimeout(r, 1000));
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  }

  async function onPhoneSubmit(data: OtpPhoneForm) {
    setIsLoading(true);
    try {
      console.log('Send OTP to', data.phone);
      await new Promise((r) => setTimeout(r, 800));
      setOtpStep('code');
    } finally {
      setIsLoading(false);
    }
  }

  async function onCodeSubmit(data: OtpCodeForm) {
    setIsLoading(true);
    try {
      console.log('Verify OTP', data.code);
      await new Promise((r) => setTimeout(r, 800));
      router.push('/dashboard');
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
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Tabs */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            {(['email', 'otp'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'flex-1 text-sm font-medium py-2 rounded-lg transition-colors',
                  tab === t
                    ? 'bg-white text-[#1A3C6E] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {t === 'email' ? 'Email & Password' : 'Phone OTP'}
              </button>
            ))}
          </div>

          {/* Email/Password tab */}
          {tab === 'email' && (
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...emailForm.register('email')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
                />
                {emailForm.formState.errors.email && (
                  <p className="text-xs text-red-500 mt-1">{emailForm.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    {...emailForm.register('password')}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {emailForm.formState.errors.password && (
                  <p className="text-xs text-red-500 mt-1">{emailForm.formState.errors.password.message}</p>
                )}
                <div className="flex justify-end mt-1">
                  <Link href="/auth/forgot-password" className="text-xs text-[#FF6B35] hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1A3C6E] hover:bg-[#0d2444] text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Sign In
              </button>
            </form>
          )}

          {/* Phone OTP tab */}
          {tab === 'otp' && otpStep === 'phone' && (
            <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
                <div className="flex gap-2">
                  <span className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-500 bg-gray-50 flex-shrink-0">+971</span>
                  <input
                    type="tel"
                    placeholder="50 123 4567"
                    {...phoneForm.register('phone')}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
                  />
                </div>
                {phoneForm.formState.errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{phoneForm.formState.errors.phone.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1A3C6E] hover:bg-[#0d2444] text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Send OTP
              </button>
            </form>
          )}

          {tab === 'otp' && otpStep === 'code' && (
            <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} className="space-y-4">
              <p className="text-sm text-gray-600">Enter the 6-digit code sent to your phone.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Verification code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  {...codeForm.register('code')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
                />
                {codeForm.formState.errors.code && (
                  <p className="text-xs text-red-500 mt-1">{codeForm.formState.errors.code.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1A3C6E] hover:bg-[#0d2444] text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Verify Code
              </button>
              <button
                type="button"
                onClick={() => setOtpStep('phone')}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                ← Change phone number
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

          {/* Social logins */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4 text-[#0A66C2] fill-current" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-[#FF6B35] font-medium hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
