import type { UseFetchOptions } from 'nuxt/app'

export function useAPI<T>(url: string | (() => string), options: UseFetchOptions<T> = {}) {
  const { token } = useAuth()
  const { locale } = useI18n()

  const defaults: UseFetchOptions<T> = {
    headers: {
      Authorization: token.value ? `Bearer ${token.value}` : '',
      'Accept-Language': locale.value
    }
  }

  // Merge headers
  if (options.headers) {
    defaults.headers = { ...defaults.headers, ...options.headers }
  }

  return useFetch<T>(url, {
    ...defaults,
    ...options
  } as any)
}
