// utils/api.ts
import type { NitroFetchRequest, NitroFetchOptions } from 'nitropack'

export function $api<T = unknown>(
  request: NitroFetchRequest,
  opts?: NitroFetchOptions<NitroFetchRequest>
) {
  // Get token and locale from composables
  // Note: This function must be called in Nuxt Context (setup, event handler, lifecycle)
  const { token } = useAuth()
  const { locale } = useI18n()

  const headers: any = {
    'Accept-Language': locale.value,
    ...opts?.headers // Prioritize the passed headers if they match
  }

  if (token.value) headers.Authorization = `Bearer ${token.value}`

  // Call the original $fetch with the given options merge 
  return $fetch<T>(request, {
    ...opts,
    headers,
  })
}