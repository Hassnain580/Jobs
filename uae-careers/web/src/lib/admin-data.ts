// Shared admin data — single source of truth for all admin pages and the dashboard
// When real API is connected, replace these arrays with API fetches

export type JobStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type UserRole = 'job_seeker' | 'employer' | 'admin';
export type UserStatus = 'approved' | 'pending' | 'rejected' | 'banned';
export type EmployerStatus = 'active' | 'pending' | 'suspended';

export interface AdminJob {
  id: number; title: string; employer: string; category: string;
  country: string; city: string; job_type: string;
  salary_min: string; salary_max: string; description: string;
  apply_method: string; apply_contact: string;
  is_featured: boolean; is_walk_in: boolean;
  status: JobStatus; expiry_date: string; created: string; views: number;
}

export interface AdminUser {
  id: number; name: string; email: string; phone: string;
  role: UserRole; status: UserStatus; registered: string; lastActive: string;
}

export interface AdminEmployer {
  id: number; company: string; contact_name: string; email: string;
  phone: string; country: string; industry: string; website: string;
  description: string; jobs_posted: number; jobs_active: number;
  status: EmployerStatus; joined: string; verified: boolean;
}

export const ADMIN_JOBS: AdminJob[] = [
  { id: 1, title: 'Senior Software Engineer', employer: 'Tech Corp Dubai', category: 'IT', country: 'UAE', city: 'Dubai', job_type: 'full_time', salary_min: '15000', salary_max: '25000', description: '', apply_method: 'email', apply_contact: 'hr@techcorp.ae', is_featured: true, is_walk_in: false, status: 'pending', expiry_date: '2026-07-12', created: '2026-06-12', views: 0 },
  { id: 2, title: 'Marketing Manager', employer: 'Global Media UAE', category: 'Marketing', country: 'UAE', city: 'Dubai', job_type: 'full_time', salary_min: '12000', salary_max: '20000', description: '', apply_method: 'email', apply_contact: 'jobs@globalmediauae.com', is_featured: false, is_walk_in: false, status: 'approved', expiry_date: '2026-07-11', created: '2026-06-11', views: 342 },
  { id: 3, title: 'Financial Analyst', employer: 'Emirates Bank', category: 'Finance', country: 'UAE', city: 'Abu Dhabi', job_type: 'full_time', salary_min: '10000', salary_max: '16000', description: '', apply_method: 'email', apply_contact: 'careers@emiratesbank.ae', is_featured: false, is_walk_in: false, status: 'approved', expiry_date: '2026-05-01', created: '2026-06-11', views: 521 },
  { id: 4, title: 'HR Coordinator', employer: 'Majid Al Futtaim', category: 'HR', country: 'UAE', city: 'Dubai', job_type: 'full_time', salary_min: '7000', salary_max: '10000', description: '', apply_method: 'email', apply_contact: 'hr@maf.ae', is_featured: false, is_walk_in: false, status: 'rejected', expiry_date: '2026-07-10', created: '2026-06-10', views: 0 },
  { id: 5, title: 'Sales Executive', employer: 'Noon.com', category: 'Sales', country: 'UAE', city: 'Dubai', job_type: 'full_time', salary_min: '6000', salary_max: '9000', description: '', apply_method: 'link', apply_contact: 'https://noon.com/careers', is_featured: false, is_walk_in: false, status: 'pending', expiry_date: '2026-07-10', created: '2026-06-10', views: 0 },
  { id: 6, title: 'Civil Engineer', employer: 'Aldar Properties', category: 'Engineering', country: 'UAE', city: 'Abu Dhabi', job_type: 'contract', salary_min: '10000', salary_max: '18000', description: '', apply_method: 'email', apply_contact: 'recruitment@aldar.com', is_featured: false, is_walk_in: false, status: 'approved', expiry_date: '2026-07-09', created: '2026-06-09', views: 789 },
];

export const ADMIN_USERS: AdminUser[] = [
  { id: 1, name: 'Ahmed Al Mansouri', email: 'ahmed@email.com', phone: '+971501234567', role: 'job_seeker', status: 'approved', registered: '2026-06-13', lastActive: '2026-06-13' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@techcorp.ae', phone: '+971551234567', role: 'employer', status: 'pending', registered: '2026-06-13', lastActive: '2026-06-13' },
  { id: 3, name: 'Mohammed Al Rashid', email: 'mo@email.com', phone: '+971521234567', role: 'job_seeker', status: 'pending', registered: '2026-06-12', lastActive: '2026-06-12' },
  { id: 4, name: 'Priya Sharma', email: 'priya@company.com', phone: '+971561234567', role: 'employer', status: 'approved', registered: '2026-06-12', lastActive: '2026-06-13' },
  { id: 5, name: 'John Williams', email: 'john@email.com', phone: '+971581234567', role: 'job_seeker', status: 'rejected', registered: '2026-06-11', lastActive: '2026-06-11' },
  { id: 6, name: 'Fatima Al Zaabi', email: 'fatima@email.com', phone: '+971541234567', role: 'job_seeker', status: 'approved', registered: '2026-06-10', lastActive: '2026-06-13' },
  { id: 7, name: 'Raj Kumar', email: 'raj@gulftech.ae', phone: '+971531234567', role: 'employer', status: 'banned', registered: '2026-06-05', lastActive: '2026-06-08' },
  { id: 8, name: 'Nora Al Hashimi', email: 'nora@email.com', phone: '+971591234567', role: 'job_seeker', status: 'approved', registered: '2026-06-09', lastActive: '2026-06-12' },
  { id: 9, name: 'David Chen', email: 'david@horizons.ae', phone: '+971501111111', role: 'employer', status: 'pending', registered: '2026-06-08', lastActive: '2026-06-08' },
  { id: 10, name: 'Layla Hassan', email: 'layla@email.com', phone: '+971552222222', role: 'job_seeker', status: 'approved', registered: '2026-06-07', lastActive: '2026-06-11' },
];

export const ADMIN_EMPLOYERS: AdminEmployer[] = [
  { id: 1, company: 'Emirates Group', contact_name: 'Fatima Al Rashid', email: 'recruit@emirates.ae', phone: '+971 4 712 5000', country: 'UAE', industry: 'Aviation', website: 'https://emirates.com', description: 'Global airline and aviation services group based in Dubai.', jobs_posted: 24, jobs_active: 8, status: 'active', joined: '2026-01-10', verified: true },
  { id: 2, company: 'ADNOC', contact_name: 'Mohammed Al Mazrouei', email: 'careers@adnoc.ae', phone: '+971 2 707 0000', country: 'UAE', industry: 'Oil & Gas', website: 'https://adnoc.ae', description: 'Abu Dhabi National Oil Company — leading energy company.', jobs_posted: 18, jobs_active: 5, status: 'active', joined: '2026-01-15', verified: true },
  { id: 3, company: 'Emaar Properties', contact_name: 'Sarah Johnson', email: 'hr@emaar.ae', phone: '+971 4 367 3333', country: 'UAE', industry: 'Real Estate', website: 'https://emaar.com', description: 'Leading real estate developer behind Burj Khalifa and Downtown Dubai.', jobs_posted: 12, jobs_active: 3, status: 'active', joined: '2026-02-01', verified: true },
  { id: 4, company: 'NMC Health', contact_name: 'Anil Sharma', email: 'jobs@nmc.ae', phone: '+971 2 633 2255', country: 'UAE', industry: 'Healthcare', website: 'https://nmchealth.com', description: 'Largest private healthcare provider in the UAE.', jobs_posted: 9, jobs_active: 4, status: 'pending', joined: '2026-03-10', verified: false },
  { id: 5, company: 'Global Media UAE', contact_name: 'Omar Al-Qassim', email: 'hr@globalmediauae.com', phone: '+971 4 456 7890', country: 'UAE', industry: 'Media', website: 'https://globalmediauae.com', description: 'Leading media and broadcasting company in Dubai, UAE.', jobs_posted: 6, jobs_active: 2, status: 'active', joined: '2026-02-20', verified: true },
  { id: 6, company: 'Noon.com', contact_name: 'Priya Patel', email: 'talent@noon.com', phone: '+971 4 200 1234', country: 'UAE', industry: 'E-Commerce', website: 'https://noon.com', description: "Middle East's homegrown e-commerce marketplace.", jobs_posted: 15, jobs_active: 7, status: 'active', joined: '2026-01-28', verified: true },
  { id: 7, company: 'Aldar Properties', contact_name: 'Khalid Al-Hosani', email: 'recruit@aldar.com', phone: '+971 2 810 5555', country: 'UAE', industry: 'Real Estate', website: 'https://aldar.com', description: "Abu Dhabi's largest real estate developer.", jobs_posted: 8, jobs_active: 1, status: 'suspended', joined: '2026-02-14', verified: false },
  { id: 8, company: 'DP World', contact_name: 'James Richardson', email: 'careers@dpworld.com', phone: '+971 4 881 5555', country: 'UAE', industry: 'Logistics', website: 'https://dpworld.com', description: 'Global smart end-to-end supply chain and logistics company.', jobs_posted: 11, jobs_active: 3, status: 'active', joined: '2026-03-01', verified: true },
  { id: 9, company: 'G42', contact_name: 'Layla Al Nuaimi', email: 'hr@g42.ai', phone: '+971 2 491 4200', country: 'UAE', industry: 'Technology', website: 'https://g42.ai', description: 'Abu Dhabi based AI and cloud computing company.', jobs_posted: 20, jobs_active: 9, status: 'pending', joined: '2026-04-05', verified: false },
  { id: 10, company: 'Majid Al Futtaim', contact_name: 'Rania Hassan', email: 'talent@maf.ae', phone: '+971 4 294 0000', country: 'UAE', industry: 'Retail', website: 'https://majidalfuttaim.com', description: 'Iconic lifestyle destination brand operating across 17 countries.', jobs_posted: 30, jobs_active: 12, status: 'active', joined: '2026-01-05', verified: true },
];

// Computed stats — derived from actual data, never hardcoded
export function computeStats() {
  const totalJobs = ADMIN_JOBS.length;
  const activeJobs = ADMIN_JOBS.filter(j => j.status === 'approved' && new Date(j.expiry_date) >= new Date()).length;
  const pendingJobs = ADMIN_JOBS.filter(j => j.status === 'pending').length;

  const totalUsers = ADMIN_USERS.length;
  const activeUsers = ADMIN_USERS.filter(u => u.status === 'approved').length;
  const pendingUsers = ADMIN_USERS.filter(u => u.status === 'pending').length;

  const totalEmployers = ADMIN_EMPLOYERS.length;
  const activeEmployers = ADMIN_EMPLOYERS.filter(e => e.status === 'active').length;
  const pendingEmployers = ADMIN_EMPLOYERS.filter(e => e.status === 'pending').length;

  const totalViews = ADMIN_JOBS.reduce((sum, j) => sum + j.views, 0);
  const totalJobsPosted = ADMIN_EMPLOYERS.reduce((sum, e) => sum + e.jobs_posted, 0);

  return {
    totalJobs, activeJobs, pendingJobs,
    totalUsers, activeUsers, pendingUsers,
    totalEmployers, activeEmployers, pendingEmployers,
    totalViews, totalJobsPosted,
  };
}
