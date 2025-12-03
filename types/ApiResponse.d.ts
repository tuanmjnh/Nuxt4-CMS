export { }

declare global {
  interface ApiResponse<T = any> {
    data: T
    message?: string,
    nextCursor?: string | number | Date | null,
    pagination?: {
      total: number,
      limit: number,
      offset: number,
      page: number,
      pages: number
    }
  }
}
