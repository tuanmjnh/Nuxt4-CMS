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
      isDeleted: boolean
      deletedAt?: string | Date
      createdAt: string | Date
      updatedAt: string | Date
    }
  }
}
