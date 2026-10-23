const BASE_URL = import.meta.env.VITE_API_URL 

type QueryValue = string | number | boolean | undefined | null

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  params?: Record<string, QueryValue>
}

export class HttpError extends Error {
  readonly status: number
  readonly data: unknown

  constructor(status: number, data: unknown) {
    super(`Request failed with status ${status}`)
    this.name = 'HttpError'
    this.status = status
    this.data = data
  }
}

function buildQuery(params: Record<string, QueryValue>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      search.append(key, String(value))
    }
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

async function parseBody(response: Response): Promise<unknown> {
  // 如果响应体为空、不是 JSON、或者服务端返回了 HTML 错误页，response.json() 会直接 reject
  // 而且 body 已经被消费掉，之后通常不能再 await response.text() 去读原始内容。
  const text = await response.text()
  if (!text) {
    return null
  }
  const contentType = response.headers.get('content-type') ?? ''
  return contentType.includes('application/json') ? JSON.parse(text) : text
}
export async function requestStream(
  path: string,
  options: RequestOptions = {}
): Promise<Response> {
  const { body, params, headers, ...init } = options
  const url = `${BASE_URL}${path}`
  const finalHeaders = new Headers(headers)
  finalHeaders.set('Content-Type', 'application/json')
  const response = await fetch(url, {
    ...init,
    headers: finalHeaders,
    body: JSON.stringify({...params})
  })

  return response
}
export async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, params, headers, ...init } = options
  const url = `${BASE_URL}${path}${params ? buildQuery(params) : ''}`
  const finalHeaders = new Headers(headers)
  if (body !== undefined && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, {
    ...init,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = await parseBody(response)

  if (!response.ok) {
    throw new HttpError(response.status, data)
  }

  return data as T
}

type MethodOptions = Omit<RequestOptions, 'method' | 'body'>

export const http = {
  get: <T>(path: string, options?: MethodOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: MethodOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: MethodOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: MethodOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: MethodOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
  stream: (path: string, options?: MethodOptions) =>
    requestStream(path, { ...options, method: 'POST'}),
}
