export { }

declare global {
  namespace Models {
    interface User {
      _id: string
      email: string
      username: string
      name: string
      roles: (Role | string)[]
      category?: string
      avatar?: Cloudinary.IFileAttach
      avatars?: Cloudinary.IFileAttach[]
      bio?: string
      personNumber?: string
      phoneNumber?: string
      region?: string
      dateBirth?: number
      gender?: string
      address?: string
      salt?: string
      lastLogin?: number
      lastChangePass?: number
      isActive: boolean
      isDeleted: boolean
      deletedAt?: number
      createdAt: number
      updatedAt: number
      history: IChangeData | null
    }
  }
}
