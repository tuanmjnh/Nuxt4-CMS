export const useSettingsStore = defineStore('settingsStore', () => {
  const appConfig = useAppConfig()
  const colorMode = useColorMode()

  // Persisted state
  const primary = useLocalStorage('nuxt-ui-primary', 'blue')
  const gray = useLocalStorage('nuxt-ui-gray', 'cool')
  const navbarType = useLocalStorage('nuxt-ui-navbar-type', 'Sidebar')
  const direction = useLocalStorage('nuxt-ui-direction', 'LTR')

  // Sync with appConfig
  watch(primary, (val) => {
    appConfig.ui.colors.primary = val
  }, { immediate: true })

  watch(gray, (val) => {
    appConfig.ui.colors.gray = val
  }, { immediate: true })

  // Theme is handled by colorMode module which persists automatically
  const theme = computed({
    get: () => colorMode.preference,
    set: (val) => { colorMode.preference = val }
  })

  watch(direction, (val) => {
    if (import.meta.client)
      document.documentElement.dir = val.toLowerCase()
  }, { immediate: true })

  return {
    primary,
    gray,
    theme,
    navbarType,
    direction
  }
})
