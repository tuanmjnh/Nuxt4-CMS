export { }

declare global {
  namespace Models {
    interface Role {
      _id: string
      name: string
      description?: string
      permissions: string[]
      // allowedRoutes: (AdminRoute | string)[]
      isDefault: boolean
      isDeleted: boolean
      deletedAt?: number
      createdAt: number
      updatedAt: number
      history: IChangeData | null
    }
  }
}
