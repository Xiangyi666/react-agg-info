interface ApiResponse<T> {
  status: number
  data: T
}
interface ApiError {
  status: number
  message: string
}
export type { ApiResponse, ApiError }
