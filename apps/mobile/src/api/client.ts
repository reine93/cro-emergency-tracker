type PrimitiveQueryValue = string | number | boolean | null | undefined;

export type ApiRequestErrorKind = 'timeout' | 'network' | 'http' | 'parse';

export class ApiRequestError extends Error {
  readonly kind: ApiRequestErrorKind;
  readonly status?: number;
  readonly details?: unknown;

  constructor(
    kind: ApiRequestErrorKind,
    message: string,
    options?: { status?: number; details?: unknown },
  ) {
    super(message);
    this.name = 'ApiRequestError';
    this.kind = kind;
    this.status = options?.status;
    this.details = options?.details;
  }
}

export type RequestJsonOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  query?: Record<string, PrimitiveQueryValue>;
  timeoutMs?: number;
  body?: unknown;
  headers?: Record<string, string>;
};

const DEFAULT_TIMEOUT_MS = 10_000;

export function getApiBaseUrl(): string {
  return process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || 'http://localhost:8080';
}

function buildUrl(path: string, query?: Record<string, PrimitiveQueryValue>) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(cleanPath, getApiBaseUrl());

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      url.searchParams.set(key, String(value));
    });
  }

  return url;
}

export async function requestJson<T>(path: string, options: RequestJsonOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...options.headers,
  };

  const method = options.method ?? 'GET';
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(buildUrl(path, options.query), {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      const fallback = `Request failed with status ${response.status}`;
      let message = fallback;

      try {
        const payload = await response.json();
        if (
          typeof payload === 'object' &&
          payload !== null &&
          'message' in payload &&
          typeof payload.message === 'string'
        ) {
          message = payload.message;
        }
      } catch {
        // Keep fallback message when response body is not JSON.
      }

      throw new ApiRequestError('http', message, { status: response.status });
    }

    try {
      return (await response.json()) as T;
    } catch (error) {
      throw new ApiRequestError('parse', 'Failed to parse server response.', {
        details: error,
      });
    }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiRequestError('timeout', 'Request timed out.');
    }

    throw new ApiRequestError('network', 'Network request failed.', { details: error });
  } finally {
    clearTimeout(timeout);
  }
}
