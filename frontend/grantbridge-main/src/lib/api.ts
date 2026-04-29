/**
 * GrantBridge API client
 * All requests go through Vite proxy → Django backend at localhost:8000
 */

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  // Check if token is expired by decoding the payload
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      // Token expired — clear it
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return null;
    }
  } catch {
    // Invalid token format — clear it
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return null;
  }
  return token;
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
}

export function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

// ─── Base fetch wrapper ───────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  requiresAuth: boolean = true
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  // Only attach token if we have one AND the endpoint requires auth
  if (token && requiresAuth) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const json = await res.json();

  if (!res.ok) {
    const message =
      json.message ||
      json.detail ||
      json.non_field_errors?.[0] ||
      'Request failed';
    const errors = json.errors || {};
    throw { status: res.status, message, errors };
  }
  return json;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  email: string;
  full_name: string;
  role: 'entrepreneur' | 'funder' | 'ngo';
  password: string;
  password2: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    access?: string;
    refresh?: string;
    user?: {
      id: string;
      email: string;
      full_name: string;
      role: string;
      is_email_verified: boolean;
    };
  };
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    request<AuthResponse>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, false),

  login: (payload: LoginPayload) =>
    request<any>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, false),

  logout: (refresh: string) =>
    request('/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    }),

  verifyEmail: (email: string, code: string) =>
    request('/auth/verify-email/', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }, false),

  resendVerification: (email: string) =>
    request('/auth/resend-verification/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }, false),

  forgotPassword: (email: string) =>
    request('/auth/password-reset/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }, false),

  resetPassword: (email: string, code: string, new_password: string) =>
    request('/auth/password-reset/confirm/', {
      method: 'POST',
      body: JSON.stringify({ email, code, new_password }),
    }, false),

  me: () => request<AuthResponse>('/auth/me/'),
};

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projectsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/projects/${qs}`);
  },

  detail: (slug: string) => request<any>(`/projects/${slug}/`),

  create: (data: FormData) =>
    fetch(`${BASE_URL}/projects/create/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getAccessToken()}` },
      body: data,
    }).then((r) => r.json()),

  submit: (slug: string) =>
    request(`/projects/${slug}/submit/`, { method: 'POST' }),

  save: (slug: string) =>
    request(`/projects/${slug}/save/`, { method: 'POST' }),

  myProjects: () => request<any>('/projects/mine/'),

  updates: (slug: string) => request<any>(`/projects/${slug}/updates/`),
};

// ─── Funding ──────────────────────────────────────────────────────────────────

export const fundingApi = {
  initiate: (project_id: string, amount: number, currency = 'NGN') =>
    request<any>('/funding/initiate/', {
      method: 'POST',
      body: JSON.stringify({ project_id, amount, currency }),
    }),

  myTransactions: () => request<any>('/funding/transactions/'),
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationsApi = {
  list: () => request<any>('/notifications/'),
  markAllRead: () => request('/notifications/mark-all-read/', { method: 'POST' }),
};

// ─── Analytics / Dashboard ────────────────────────────────────────────────────

export const analyticsApi = {
  myDashboard: () => request<any>('/analytics/dashboard/'),
};

// ─── Profile ──────────────────────────────────────────────────────────────────

export const profileApi = {
  get: () => request<any>('/users/profile/'),
  update: (data: Record<string, any>) =>
    request('/users/profile/update/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
