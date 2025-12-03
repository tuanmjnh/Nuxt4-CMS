export { }

declare global {
  namespace Models {
    interface Attribute {
      _id: string
      name: string
      slug: string
      type: 'post' | 'product'
      values: string[]
      isDeleted: boolean
      deletedAt?: number
      createdAt: number
      updatedAt: number
      history: IChangeData | null
    }
  }
}
