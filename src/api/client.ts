const BASE_URL = 'https://campuscare-5zm2.onrender.com';

interface RequestOptions extends RequestInit {
  body?: BodyInit | null;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const err = await res.json();
      message = err.message || err.error || message;
    } catch {}
    throw new Error(message);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/csv')) {
    return res.blob() as unknown as T;
  }
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return {} as T;
  }
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
