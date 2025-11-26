export { }

declare global {
  namespace Models {
    interface User {
      _id: string
      email: string
      username: string
      name: string
      role: Role | string
      category?: string
      avatar?: Cloudinary.IFileAttach
      bio?: string
      isActive: boolean
      createdAt: string | Date
      updatedAt: string | Date
    }

    interface UserSession {
      _id: string
      user: User | string
      refreshToken: string
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
