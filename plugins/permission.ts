export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('permission', {
    mounted(el, binding) {
      const { user } = useAuth()
      const permission = binding.value

      if (!permission) return

      const hasPermission = user.value?.role?.permissions?.includes(permission)

      if (!hasPermission) {
        if (el.parentNode) {
          el.parentNode.removeChild(el)
        } else {
          el.style.display = 'none'
        }
      }
    },
    updated(el, binding) {
      const { user } = useAuth()
      const permission = binding.value

      if (!permission) return

      const hasPermission = user.value?.role?.permissions?.includes(permission)

      if (!hasPermission) {
        if (el.parentNode) {
          el.parentNode.removeChild(el)
        } else {
          el.style.display = 'none'
        }
      }
    }
  })
})
