export type UserRole = 'candidate' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface EducationItem {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear?: number | null;
}

export interface ExperienceItem {
  jobTitle: string;
  company: string;
  description?: string;
  startDate: string;
  endDate?: string | null;
  currentlyWorking: boolean;
}

export interface ResumeMetadata {
  fileId: string;
  filename: string;
  contentType: string;
  size: number;
  uploadedAt: string;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  phone: string;
  location: string;
  headline: string;
  bio: string;
  skills: string[];
  education: EducationItem[];
  experience: ExperienceItem[];
  resumeFileId: string | null;
  resume: ResumeMetadata | null;
  profileCompletion: number;
  updatedAt: string;
}

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
export type WorkplaceType = 'Remote' | 'Hybrid' | 'On-site';
export type ExperienceLevel = 'Entry' | 'Mid' | 'Senior' | 'Lead';
export type JobStatus = 'draft' | 'published' | 'archived';

export interface SalaryRange {
  min?: number | null;
  max?: number | null;
  currency: string;
  period: 'year' | 'month';
  isDisclosed: boolean;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyDescription?: string;
  location: string;
  employmentType: EmploymentType;
  workplaceType: WorkplaceType;
  experienceLevel: ExperienceLevel;
  category: string;
  salaryRange?: SalaryRange;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  status: JobStatus;
  postedAt: string | null;
  createdAt: string;
  updatedAt: string;
  applicationCount?: number;
}

export type ApplicationStatus =
  | 'Applied'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview'
  | 'Rejected'
  | 'Hired';

export interface StatusHistoryItem {
  status: ApplicationStatus;
  changedAt: string;
  note?: string;
  changedBy?: string;
}

export interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  job: Partial<Job> | null;
  resumeFileId: string | null;
  coverLetter: string;
  status: ApplicationStatus;
  statusHistory: StatusHistoryItem[];
  appliedAt: string;
  updatedAt: string;
}

export interface AdminApplicationItem {
  id: string;
  status: ApplicationStatus;
  coverLetter: string;
  statusHistory: StatusHistoryItem[];
  appliedAt: string;
  updatedAt: string;
  candidate: {
    id: string;
    name: string;
    email: string;
    profile: {
      phone: string;
      location: string;
      headline: string;
      bio: string;
      skills: string[];
      education: EducationItem[];
      experience: ExperienceItem[];
      profileCompletion: number;
    } | null;
  } | null;
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    employmentType: string;
    status: string;
  } | null;
  resume: ResumeMetadata | null;
}

export interface AdminDashboardData {
  metrics: {
    totalJobs: number;
    publishedJobs: number;
    draftJobs: number;
    archivedJobs: number;
    totalApplications: number;
  };
  applicationsByStatus: Record<ApplicationStatus, number>;
  recentActivity: Array<{
    id: string;
    status: ApplicationStatus;
    appliedAt: string;
    updatedAt: string;
    candidate: { id: string; name: string; email: string } | null;
    job: { id: string; title: string; company: string; location: string } | null;
  }>;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

