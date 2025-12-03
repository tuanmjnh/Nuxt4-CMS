export { }

declare global {
  namespace Models {
    interface AdminRoute {
      _id: string
      path: string
      name: string
      icon?: string
      sort: number
      isVisible: boolean
      parent?: AdminRoute | string
      children?: AdminRoute[]
      createdAt: number
      updatedAt: number
      history: IChangeData | null
    }
  }
}
