export { }

declare global {
  namespace Models {
    interface SystemRoute {
      _id: string
      path: string
      name: string
      icon?: string
      sort: number
      isVisible: boolean
      parent?: SystemRoute | string
      children?: SystemRoute[]
      createdAt: number
      updatedAt: number
      history: IChangeData | null
    }
  }
}
