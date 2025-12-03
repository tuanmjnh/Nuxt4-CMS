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
      lastActiveAt: number
      expiresAt: number
      createdAt: number
      updatedAt: number
      history: IChangeData | null
    }
  }
}
