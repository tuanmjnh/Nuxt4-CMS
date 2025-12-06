export const useAdminNavigation = () => {
  const routes = useState<Models.SystemRoute[]>('admin-routes-state', () => [])
  const loading = ref(false)

  const fetchRoutes = async (forceString = false) => {
    if (routes.value.length > 0 && !forceString) return

    loading.value = true
    try {
      const { data } = await useAPI<{ success: boolean, data: Models.SystemRoute[] }>('/api/routes', {
        key: 'admin-routes'
      })
      if (data.value?.data) {
        routes.value = data.value.data
      }
    } finally {
      loading.value = false
    }
  }

  return { routes, fetchRoutes, loading }
}
