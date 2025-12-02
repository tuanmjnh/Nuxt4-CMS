export { }

declare global {
  namespace Models {
    interface UserSession {
      _id: string
      user: User | string
      refreshToken: string
      deviceId: string
      deviceType: 'pc' | 'mobile' | 'tablet' | 'web'
      userAgent?: string
      ip?: string
      lastActiveAt: string | Date
      expiresAt: string | Date
      createdAt: string | Date
      updatedAt: string | Date
    }
  }
}
