/**
 * resume 模块内部的小工具。不引入新依赖，deepEqual/debounce 手写实现，
 * 克隆走 JSON 往返（简历数据保证是纯 JSON 值）。
 */

/** 深比较两个纯 JSON 值。用于判断服务端数据与本地草稿是否一致。 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (typeof a !== typeof b || a === null || b === null) return false

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false
    return a.every((item, index) => deepEqual(item, b[index]))
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a as Record<string, unknown>)
    const keysB = Object.keys(b as Record<string, unknown>)
    if (keysA.length !== keysB.length) return false
    return keysA.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(b, key) &&
        deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
    )
  }

  return false
}

/** 深克隆纯 JSON 数据。简历数据不含 Date/Map 等特殊值，JSON 往返即可。 */
export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

/** 是否为普通对象（非数组、非 null）。 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

interface DebouncedFunction {
  (...args: unknown[]): void
  cancel: () => void
  flush: () => void
}

/**
 * 简易 debounce，只需同步无参调用场景（自动保存排队）。
 * 提供 cancel 丢弃与 flush 立即执行，用于离开页面时兜底保存。
 */
export function debounce(fn: () => void, waitMs: number): DebouncedFunction {
  let timer: ReturnType<typeof setTimeout> | undefined

  const debounced = () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = undefined
      fn()
    }, waitMs)
  }

  debounced.cancel = () => {
    if (timer) clearTimeout(timer)
    timer = undefined
  }

  debounced.flush = () => {
    if (!timer) return
    debounced.cancel()
    fn()
  }

  return debounced
}

/** 生成 UUID，优先使用浏览器原生 randomUUID。 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  // 兜底拼接，保证旧环境也能生成全局唯一的 id
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/** 去掉 HTML 标签只留文本，用于摘要展示。 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
