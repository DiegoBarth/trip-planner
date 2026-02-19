import { API_URL, API_TIMEOUT_MS, POST_RATE_LIMIT_MS } from '@/config/constants';

const lastPostByAction = new Map<string, number>();

function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;

  const meta =
    document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]') ??
    document.querySelector<HTMLMetaElement>('meta[name="csrf_token"]') ??
    document.querySelector<HTMLMetaElement>('meta[name="csrfToken"]');

  return meta?.content ?? null;
}

function enforcePostRateLimit(action: string) {
  const now = Date.now();
  const lastSent = lastPostByAction.get(action) ?? 0;

  if (now - lastSent < POST_RATE_LIMIT_MS) {
    throw new Error('Aguarde um instante antes de enviar novamente.');
  }

  lastPostByAction.set(action, now);
}

async function fetchWithTimeout(url: string, options: RequestInit & { timeoutMs?: number } = {}): Promise<Response> {
  const { timeoutMs = API_TIMEOUT_MS, ...fetchOptions } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  const headers = new Headers(fetchOptions.headers);
  const csrfToken = getCsrfToken();

  if (csrfToken && !headers.has('X-CSRF-Token')) {
    headers.set('X-CSRF-Token', csrfToken);
  }

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal
    });

    clearTimeout(id);

    return res;
  }
  catch (err) {
    clearTimeout(id);

    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('A requisição demorou demais. Tente novamente.');
      }

      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        throw new Error('Sem conexão. Verifique sua internet e tente novamente.');
      }
    }

    throw err;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();

    throw new Error(text || 'Erro na API');
  }
  return res.json();
}

export async function apiGet<T>(params: Record<string, string | number>): Promise<T> {
  const query = new URLSearchParams(
    params as Record<string, string>
  ).toString();

  try {
    const res = await fetchWithTimeout(`${API_URL}?${query}`);

    return handleResponse<T>(res);
  }
  catch (err) {
    if (err instanceof Error) throw err;

    throw new Error('Erro ao conectar com o servidor.');
  }
}

export async function apiPost<T>(body: Record<string, unknown>): Promise<T> {
  try {
    const action = typeof body.action === 'string' ? body.action : 'POST';

    enforcePostRateLimit(action);

    const res = await fetchWithTimeout(API_URL, {
      method: 'POST',
      body: JSON.stringify(body)
    });

    return handleResponse<T>(res);
  }
  catch (err) {
    if (err instanceof Error) throw err;

    throw new Error('Erro ao conectar com o servidor.');
  }
}