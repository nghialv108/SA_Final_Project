const API = '/api';

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

const getToken = () => localStorage.getItem('accessToken');
const getWorkspaceId = () => localStorage.getItem('workspaceId');

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const ws = getWorkspaceId();
  if (ws) headers.set('x-workspace-id', ws);

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const body = (await res.json()) as ApiEnvelope<T> & { message?: string };

  if (!res.ok) {
    throw new Error(body.message || `HTTP ${res.status}`);
  }
  return body.data;
}

export const authApi = {
  login: (email: string, password: string) =>
    api<{ user: Record<string, unknown>; accessToken: string; refreshToken: string }>(
      '/iam/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
    ),
  register: (fullName: string, email: string, password: string) =>
    api<{ user: Record<string, unknown>; accessToken: string; refreshToken: string }>(
      '/iam/auth/register',
      { method: 'POST', body: JSON.stringify({ fullName, email, password }) },
    ),
};

export const workspaceApi = {
  mine: () =>
    api<Array<{ _id?: string; id?: string; name: string; role: string }>>(
      '/iam/workspaces/mine',
    ),
  create: (body: { name: string; slug: string; description?: string }) =>
    api<{ _id?: string; id?: string; name: string; slug: string }>(
      '/iam/workspaces',
      { method: 'POST', body: JSON.stringify(body) },
    ),
};

export const bffApi = {
  dashboard: () => api<Record<string, unknown>>('/bff/dashboard'),
  projects: () => api<unknown[]>('/bff/projects'),
  profile: () => api<Record<string, unknown>>('/bff/users/me'),
};

export const searchApi = {
  find: (q: string, type = 'all') =>
    api<{ query: string; total: number; results: Array<{ type: string; id: string; title: string; subtitle?: string }> }>(
      `/search?q=${encodeURIComponent(q)}&type=${type}`,
    ),
};

export const reportApi = {
  workspaceSummary: () =>
    api<Record<string, unknown>>('/reports/workspace-summary?format=json'),
  projectStatus: (projectId: string) =>
    api<Record<string, unknown>>(`/reports/project/${projectId}/status?format=json`),
};
