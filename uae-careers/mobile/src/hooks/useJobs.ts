import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  InfiniteData,
} from '@tanstack/react-query';
import { api } from '../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Job {
  id: string;
  slug: string;
  title: string;
  description: string;
  requirements?: string;
  importantNote?: string;
  jobType: 'full_time' | 'part_time' | 'contract' | 'walk_in' | 'internship';
  country: string;
  city?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  category: string;
  isFeatured: boolean;
  isWalkIn: boolean;
  isSponsored: boolean;
  applyMethod: 'email' | 'phone' | 'website' | 'whatsapp' | 'in_person';
  applyContact?: string;
  applyUrl?: string;
  viewCount: number;
  applicationCount: number;
  isSaved?: boolean;
  createdAt: string;
  expiresAt?: string;
  employer: {
    id: string;
    companyName: string;
    companyLogo?: string;
    industry?: string;
    country?: string;
    isVerified: boolean;
  };
}

export interface JobFilters {
  country?: string;
  category?: string;
  jobType?: string;
  query?: string;
  page?: number;
  limit?: number;
}

interface PaginatedResponse {
  data: {
    jobs: Job[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ─── Query keys ───────────────────────────────────────────────────────────────

export const jobKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobKeys.all, 'list'] as const,
  list: (filters: JobFilters) => [...jobKeys.lists(), filters] as const,
  featured: () => [...jobKeys.all, 'featured'] as const,
  walkIn: () => [...jobKeys.all, 'walk-in'] as const,
  detail: (slug: string) => [...jobKeys.all, 'detail', slug] as const,
  saved: () => ['saved-jobs'] as const,
  myApplications: () => ['my-applications'] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useJobs(filters: JobFilters = {}) {
  return useInfiniteQuery<PaginatedResponse, Error, InfiniteData<PaginatedResponse>, ReturnType<typeof jobKeys.list>, number>({
    queryKey: jobKeys.list(filters),
    queryFn: ({ pageParam }) =>
      api
        .get('/jobs', { params: { ...filters, page: pageParam, limit: filters.limit ?? 10 } })
        .then((r) => r.data),
    getNextPageParam: (last) =>
      last.data?.hasMore ? last.data.page + 1 : undefined,
    initialPageParam: 1,
  });
}

export function useFeaturedJobs() {
  return useQuery<Job[], Error>({
    queryKey: jobKeys.featured(),
    queryFn: () =>
      api.get('/jobs/featured').then((r) => r.data.data ?? r.data),
  });
}

export function useWalkInJobs() {
  return useQuery<Job[], Error>({
    queryKey: jobKeys.walkIn(),
    queryFn: () =>
      api.get('/jobs/walk-in').then((r) => r.data.data ?? r.data),
  });
}

export function useJob(slug: string) {
  return useQuery<Job, Error>({
    queryKey: jobKeys.detail(slug),
    queryFn: () =>
      api.get(`/jobs/${slug}`).then((r) => r.data.data ?? r.data),
    enabled: !!slug,
  });
}

export function useSearchJobs(query: string, filters: Omit<JobFilters, 'query'> = {}) {
  return useInfiniteQuery<PaginatedResponse, Error, InfiniteData<PaginatedResponse>, ReturnType<typeof jobKeys.list>, number>({
    queryKey: jobKeys.list({ query, ...filters }),
    queryFn: ({ pageParam }) =>
      api
        .get('/jobs/search', {
          params: { q: query, ...filters, page: pageParam, limit: 10 },
        })
        .then((r) => r.data),
    getNextPageParam: (last) =>
      last.data?.hasMore ? last.data.page + 1 : undefined,
    initialPageParam: 1,
    enabled: query.length > 1,
  });
}

export function useSavedJobs() {
  return useQuery<Job[], Error>({
    queryKey: jobKeys.saved(),
    queryFn: () => api.get('/saved').then((r) => r.data.data ?? r.data),
  });
}

export function useMyApplications() {
  return useQuery({
    queryKey: jobKeys.myApplications(),
    queryFn: () =>
      api.get('/applications/my').then((r) => r.data.data ?? r.data),
  });
}

export function useSaveJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => api.post(`/saved/${jobId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: jobKeys.saved() });
      qc.invalidateQueries({ queryKey: jobKeys.all });
    },
  });
}

export function useUnsaveJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => api.delete(`/saved/${jobId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: jobKeys.saved() });
      qc.invalidateQueries({ queryKey: jobKeys.all });
    },
  });
}

export function useApplyJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, coverLetter }: { jobId: string; coverLetter?: string }) =>
      api.post('/applications', { jobId, coverLetter }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: jobKeys.myApplications() });
    },
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Job>) => api.post('/jobs', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: jobKeys.all });
    },
  });
}
