import type { UseFetchOptions } from 'nuxt/app'

export function useAPI<T>(url: string | (() => string), options: UseFetchOptions<T> = {}) {
  const { token } = useAuth()
  const { locale } = useI18n()

  const headers: any = { 'Accept-Language': locale.value }
  if (token.value) headers.Authorization = `Bearer ${token.value}`
  const defaults: UseFetchOptions<T> = { headers }

  // Merge headers
  if (options.headers) defaults.headers = { ...defaults.headers, ...options.headers }

  return useFetch<T>(url, {
    ...defaults,
    ...options
  } as any)
}
