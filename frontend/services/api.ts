import type {
  AdminApplicationItem,
  AdminDashboardData,
  Application,
  ApplicationStatus,
  CandidateProfile,
  Job,
  PaginationMeta,
  ResumeMetadata,
  User,
} from '@/types';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5000/api';

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: Record<string, string>;

  constructor(
    message: string,
    status = 500,
    code = 'API_ERROR',
    details?: Record<string, string>
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: Record<string, string> = {
    'X-Requested-With': 'XMLHttpRequest',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch {
    throw new ApiClientError(
      'Unable to reach the server. Please verify the API service is running.',
      0,
      'NETWORK_ERROR'
    );
  }

  const json = await response.json().catch(() => null);

  if (!response.ok || (json && json.success === false)) {
    const errObj = json?.error;
    throw new ApiClientError(
      errObj?.message || `Request failed with status ${response.status}`,
      response.status,
      errObj?.code || 'REQUEST_FAILED',
      errObj?.details
    );
  }

  return json?.data as T;
}

export const authApi = {
  register(payload: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) {
    return request<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  login(payload: { email: string; password: string }) {
    return request<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  logout() {
    return request<void>('/auth/logout', { method: 'POST' });
  },
  me() {
    return request<{ user: User }>('/auth/me');
  },
};

export const profileApi = {
  getMe() {
    return request<{ user: User; profile: CandidateProfile }>('/profile/me');
  },
  updateMe(payload: Record<string, unknown>) {
    return request<{ user: User; profile: CandidateProfile }>('/profile/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  uploadResume(file: File) {
    const formData = new FormData();
    formData.append('resume', file);
    return request<{ resume: ResumeMetadata; profileCompletion: number }>('/profile/resume', {
      method: 'POST',
      body: formData,
    });
  },
  getResumeDownloadUrl() {
    return `${API_BASE}/profile/resume`;
  },
};

export const jobsApi = {
  list(params: Record<string, string | number | undefined> = {}) {
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '' && v !== null) {
        search.set(k, String(v));
      }
    }
    const qs = search.toString();
    return request<{
      jobs: Job[];
      categories?: string[];
      pagination: PaginationMeta;
    }>(`/jobs${qs ? `?${qs}` : ''}`);
  },
  getById(id: string) {
    return request<{
      job: Job;
      hasApplied: boolean;
      application: { id: string; status: ApplicationStatus; appliedAt: string } | null;
    }>(`/jobs/${id}`);
  },
  create(payload: Record<string, unknown>) {
    return request<{ job: Job }>('/jobs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  update(id: string, payload: Record<string, unknown>) {
    return request<{ job: Job }>(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  archiveOrDelete(id: string, hard = false) {
    return request<{ action: string }>(`/jobs/${id}${hard ? '?hard=true' : ''}`, {
      method: 'DELETE',
    });
  },
};

export const applicationsApi = {
  apply(payload: { jobId: string; coverLetter?: string }) {
    return request<{ application: Application }>('/applications', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getMine() {
    return request<{ applications: Application[] }>('/applications/me');
  },
  getById(id: string) {
    return request<{ application: Application }>(`/applications/${id}`);
  },
};

export const adminApi = {
  getDashboard() {
    return request<AdminDashboardData>('/admin/dashboard');
  },
  getJobs(status?: string) {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    return request<{ jobs: Job[] }>(`/admin/jobs${qs}`);
  },
  getApplications(params: { jobId?: string; status?: string; page?: number; limit?: number } = {}) {
    const search = new URLSearchParams();
    if (params.jobId) search.set('jobId', params.jobId);
    if (params.status) search.set('status', params.status);
    if (params.page) search.set('page', String(params.page));
    if (params.limit) search.set('limit', String(params.limit));
    const qs = search.toString();
    return request<{ applications: AdminApplicationItem[]; pagination: PaginationMeta }>(
      `/admin/applications${qs ? `?${qs}` : ''}`
    );
  },
  updateApplicationStatus(id: string, payload: { status: ApplicationStatus; note?: string }) {
    return request<{ application: Application }>(`/admin/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  getCandidateResumeUrl(fileId: string) {
    return `${API_BASE}/admin/resumes/${fileId}`;
  },
};

