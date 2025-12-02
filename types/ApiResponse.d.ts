export { }

declare global {
  interface ApiResponse<T = any> {
    data: T
    message?: string,
    nextCursor?: string | number | Date | null
  }
}
