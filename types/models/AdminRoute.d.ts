export { }

declare global {
  namespace Models {
    interface AdminRoute {
      _id: string
      path: string
      name: string
      icon?: string
      sortOrder: number
      isVisible: boolean
      parent?: AdminRoute | string
      children?: AdminRoute[]
      createdAt: string | Date
      updatedAt: string | Date
    }
  }
}
