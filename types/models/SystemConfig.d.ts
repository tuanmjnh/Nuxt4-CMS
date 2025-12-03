export { }

declare global {
  namespace Models {
    interface SystemConfig {
      _id: string
      key: string
      value: any
      type: 'string' | 'number' | 'boolean' | 'json'
      isPublic: boolean
      description?: string
      createdAt: number
      updatedAt: number
      history: IChangeData | null
    }
  }
}
