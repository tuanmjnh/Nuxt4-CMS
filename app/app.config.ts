export default defineAppConfig({
  toaster: {
    position: 'top-center' as const,
    duration: 5000,
    max: 5,
    process: false,
    expand: true
  },
  ui: {
    colors: {
      primary: 'blue',//'blue',
      neutral: 'slate',
      gray: 'cool'
    },
    icons: {
      system: 'i-ph-desktop',
      light: 'i-ph-sun',
      dark: 'i-ph-moon'
    }
  }
})
