// stores/device.ts
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'

// Define Type to get fancy autocomplete
export type DeviceType = 'MOBILE' | 'TABLET' | 'DESKTOP'

export const useDeviceStore = defineStore('deviceStore', () => {
  // 1. Initialize breakpoints according to Tailwind standards (sm, md, lg, xl, 2xl) 
  const breakpoints = useBreakpoints(breakpointsTailwind)

  // 2. Define Computed properties 
  // Mobile: Smaller than 'md' (768px) 
  const isMobile = computed(() => breakpoints.smaller('md').value)

  // Tablet: From 'md' to 'lg' (768px -> 1024px) 
  const isTablet = computed(() => breakpoints.between('md', 'lg').value)

  // Desktop: Larger or equal to 'lg' (1024px)
  // You can change it to 'md' if you want Tablet to merge into Desktop
  const isDesktop = computed(() => breakpoints.greaterOrEqual('lg').value)

  // Custom logic: For example Mobile or Tablet (for touch menu)
  const isTouchDevice = computed(() => isMobile.value || isTablet.value)

  // Computed returns the correct string you need
  const deviceType = computed<DeviceType>(() => {
    // 1. Smaller than 'md' (768px) -> MOBILE
    if (breakpoints.smaller('md').value) {
      return 'MOBILE'
    }

    // 2. Smaller than 'lg' (1024px) -> TABLET
    // (Because we checked < md above, this part is understood as from md to lg)
    if (breakpoints.smaller('lg').value) {
      return 'TABLET'
    }

    // 3. Other (Greater than or equal to lg) -> DESKTOP
    return 'DESKTOP'
  })

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    deviceType
  }
})