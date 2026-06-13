import { api, setStoredToken, setStoredRefreshToken, removeStoredTokens } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LoginEmailPayload {
  email: string;
  password: string;
}

export interface LoginOTPPayload {
  phone: string;
  otp: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  role: 'job_seeker' | 'employer';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email?: string;
  phone?: string;
  firstName: string;
  lastName: string;
  role: 'job_seeker' | 'employer' | 'admin';
  avatar?: string;
  jobSeekerProfile?: JobSeekerProfile;
  employerProfile?: EmployerProfile;
  createdAt: string;
}

export interface JobSeekerProfile {
  id: string;
  headline?: string;
  bio?: string;
  cvUrl?: string;
  skills: string[];
  experience?: number;
  nationality?: string;
}

export interface EmployerProfile {
  id: string;
  companyName: string;
  companyLogo?: string;
  industry?: string;
  country?: string;
  website?: string;
  description?: string;
  isVerified: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function storeTokens(accessToken: string, refreshToken: string) {
  await setStoredToken(accessToken);
  await setStoredRefreshToken(refreshToken);
}

// ─── Auth functions ───────────────────────────────────────────────────────────

export async function loginWithEmail(payload: LoginEmailPayload): Promise<AuthResponse> {
  const { data } = await api.post('/auth/login', payload);
  const result: AuthResponse = data.data ?? data;
  await storeTokens(result.accessToken, result.refreshToken);
  return result;
}

export async function loginWithOTP(payload: LoginOTPPayload): Promise<AuthResponse> {
  const { data } = await api.post('/auth/verify-otp', payload);
  const result: AuthResponse = data.data ?? data;
  await storeTokens(result.accessToken, result.refreshToken);
  return result;
}

export async function sendOTP(phone: string): Promise<{ message: string }> {
  const { data } = await api.post('/auth/send-otp', { phone });
  return data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post('/auth/register', payload);
  const result: AuthResponse = data.data ?? data;
  await storeTokens(result.accessToken, result.refreshToken);
  return result;
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await api.get('/auth/me');
  return data.data ?? data;
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch {
    // ignore API errors on logout
  } finally {
    await removeStoredTokens();
  }
}

export async function updateProfile(payload: Partial<User>): Promise<User> {
  const { data } = await api.put('/auth/me', payload);
  return data.data ?? data;
}

export async function uploadCV(formData: FormData): Promise<{ cvUrl: string }> {
  const { data } = await api.post('/auth/cv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data ?? data;
}
