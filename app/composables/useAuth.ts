export const useAuth = () => {
  const user = useState<Models.UserWithRoles | null>('user', () => null)
  const token = useCookie('token')
  const refreshToken = useCookie('refreshToken')
  const router = useRouter()

  const getDeviceId = () => {
    const deviceId = useCookie('deviceId', { maxAge: 60 * 60 * 24 * 365 * 10 }) // 10 years
    if (!deviceId.value) deviceId.value = crypto.randomUUID()
    return deviceId.value
  }

  const login = async (usernameOrEmail: string, password: string): Promise<boolean> => {
    try {
      const data = await $fetch<Models.AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: { usernameOrEmail, password, deviceId: getDeviceId() }
      })

      if (data?.success) {
        token.value = data.data.accessToken
        refreshToken.value = data.data.refreshToken
        user.value = data.data.user
        return true
      }
      return false
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      if (refreshToken.value) {
        await $fetch('/api/auth/logout', {
          method: 'POST',
          body: { refreshToken: refreshToken.value },
          headers: token.value ? { Authorization: `Bearer ${token.value}` } : {}
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      token.value = null
      refreshToken.value = null
      user.value = null
      router.push('/admin/login')
    }
  }

  const fetchUser = async (): Promise<void> => {
    if (!token.value) return

    try {
      const data = await $fetch<Models.UserResponse>('/api/auth/me', {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      user.value = data?.data?.user
    } catch (error) {
      logout()
    }
  }

  return {
    user,
    token,
    login,
    logout,
    fetchUser
  }
}
