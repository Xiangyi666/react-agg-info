interface ApiResponse<T> {
  status: number
  data: T
}
interface ApiError {
  status: number
  message: string
}

export interface result {
  id: number
  title: string
  description: string
  keywords: string[]
  country: string
  url: string
  source: string
}
export interface searchParams {
  query: string
  page: number
  pageSize: number
  country: string[]
  source: string[]
}
export interface resultData {
  content: result[]
  totalPage: number
  curPage: number
}
export type SearchResponse = ApiResponse<resultData>

export type { ApiResponse, ApiError }
