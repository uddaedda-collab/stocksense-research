import { API_BASE_URL } from './config';
import { getIdToken } from './firebaseClient';

export class ApiClientError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE' | 'PUT';
  body?: unknown;
  auth?: boolean; // attach Firebase ID token when true
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (options.auth) {
    const token = await getIdToken();
    if (!token) {
      throw new ApiClientError(401, 'You must be signed in to perform this action.');
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data?.error) message = data.error;
    } catch {
      // ignore parse errors, use default message
    }
    throw new ApiClientError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
