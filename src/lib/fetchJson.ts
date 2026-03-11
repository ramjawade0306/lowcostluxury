const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

  // Ensure content-type is set for JSON bodies
  const headers = new Headers(options?.headers);
  if (options?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const r = await fetch(fullUrl, { ...options, headers });
  const text = await r.text();

  let json: any = {};
  if (text) {
    if (text.trim().startsWith('<')) {
      throw new Error(`Server returned HTML instead of JSON. The backend API might be offline or misconfigured. (Status ${r.status})`);
    }
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`Failed to parse server response as JSON. The backend API might be offline. (Status ${r.status})`);
    }
  }

  if (!r.ok) {
    const errorMsg = json?.detail || json?.message || json?.error || r.statusText || 'Request failed';
    const error = new Error(errorMsg) as any;
    error.status = r.status;
    error.data = json;
    throw error;
  }

  return json as T;
}
