export interface Job {
  id: number;
  slug: string;
  title: string;
  company: Company;
  location_city: string;
  location_country: string;
  country_code: string;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string;
  job_type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance';
  experience_level?: string;
  category: Category;
  description: string;
  responsibilities?: string;
  requirements?: string;
  important_note?: string;
  apply_method: 'email' | 'url' | 'whatsapp' | 'walkin';
  apply_email?: string;
  apply_url?: string;
  apply_whatsapp?: string;
  is_sponsored: boolean;
  is_featured: boolean;
  is_walk_in: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: number;
  name: string;
  logo?: string;
  slug: string;
  country?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  job_count?: number;
}

export interface ProductBanner {
  id: number;
  name: string;
  description: string;
  image?: string;
  url: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'seeker' | 'employer' | 'admin';
  avatar?: string;
  profile_completion?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface JobFilters {
  country?: string;
  city?: string;
  category?: string;
  job_type?: string;
  experience?: string;
  salary_min?: number;
  salary_max?: number;
  is_walk_in?: boolean;
  search?: string;
  page?: number;
  ordering?: string;
}
