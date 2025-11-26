export const useDashboard = () => {
  const isNotificationsSlideoverOpen = useState('notifications-slideover-open', () => false)
  const isDashboardSearchOpen = useState('dashboard-search-open', () => false)

  const toggleDashboardSearch = () => {
    isDashboardSearchOpen.value = !isDashboardSearchOpen.value
  }

  return {
    isNotificationsSlideoverOpen,
    isDashboardSearchOpen,
    toggleDashboardSearch
  }
}
