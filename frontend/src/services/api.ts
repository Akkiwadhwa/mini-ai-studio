const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = new Headers(opts.headers || {});
  if (!(opts.body instanceof FormData)) headers.set('Content-Type','application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(`${BASE_URL}${path}`, { ...opts, headers });
  if (!res.ok) {
    const fallback = res.clone();
    let data: any = null;
    try {
      data = await res.json();
    } catch {
      const text = await fallback.text().catch(() => '');
      data = text ? { error: text } : null;
    }
    const rawMessage = data?.error || data?.message;
    const message = typeof rawMessage === 'string'
      ? rawMessage
      : Array.isArray(rawMessage)
        ? rawMessage.join(', ')
        : rawMessage
          ? JSON.stringify(rawMessage)
          : `Request failed (${res.status})`;
    throw Object.assign(new Error(message), { status: res.status, data });
  }
  return res.json();
}
