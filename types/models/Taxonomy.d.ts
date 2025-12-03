export { }

declare global {
  namespace Models {
    interface Taxonomy {
      _id: string
      name: string
      slug: string
      type: 'tag' | 'keyword'
      description?: string
      color?: string
      count: number
      isDeleted: boolean
      deletedAt?: number
      createdAt: number
      updatedAt: number
    }
  }
}
