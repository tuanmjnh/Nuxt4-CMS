export { }

declare global {
  namespace Models {
    interface Tag {
      _id: string
      name: string
      slug: string
      description?: string
      color?: string
      postCount: number
      isDeleted: boolean
      deletedAt?: string | Date
      createdAt: string | Date
      updatedAt: string | Date
    }
  }
}
