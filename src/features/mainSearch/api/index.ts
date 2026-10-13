import type { resultData, searchParams, SearchResponse } from '../types'
import { http } from '@/services/api'

// 后端未就绪时的本地 mock 开关：真实接口可用后改成 false 即可
const USE_MOCK = true

const mockData: resultData = {
  curPage: 1,
  totalPage: 3, // 设为 1 时分页器自动隐藏，方便预览两种形态
  content: [
    {
      id: 1232,
      title: 'res111',
      keywords: ['mock', 'test'],
      country: 'US',
      source: 'Google',
      description: 'Mock Description',
      url: 'https://www.mock.com',
    },
    {
      id: 1344,
      title: 'res444',
      keywords: ['mock', 'test'],
      country: 'DE',
      source: 'LinkedIn',
      description: 'Mock Description',
      url: 'https://www.LinkedIn.com',
    },
  ],
}

// 数据访问层只负责"怎么拿到数据"：成功 resolve 数据，失败（网络错 / HttpError / abort）一律抛出，
// 由调用方决定怎么承接——abort 静默、错误提示等 UI 策略不在这里做。
export async function fetchResults(
  params: searchParams,
  signal?: AbortSignal
): Promise<resultData> {
  if (USE_MOCK) return mockData
  const response = await http.post<SearchResponse>('/search', params, {
    signal,
  })
  return response.data
}

export async function collect(id:number) {
    const response = await http.post<number>(`/collected/${id}`)
    return response
}