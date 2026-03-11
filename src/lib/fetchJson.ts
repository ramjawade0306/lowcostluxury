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
    try {
      json = JSON.parse(text);
    } catch {
      // Not JSON
    }
  }

  if (!r.ok) {
    const errorMsg = json.detail || json.message || json.error || r.statusText || 'Request failed';
    const error = new Error(errorMsg) as any;
    error.status = r.status;
    error.data = json;
    throw error;
  }

  return json as T;
}
