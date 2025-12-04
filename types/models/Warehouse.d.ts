declare global {
  namespace Models {
    export interface Warehouse {
      _id: string
      name: string
      code: string
      address: string
      manager: string
      phone: string
      status: 'active' | 'inactive'
      description: string
      history: any
      createdAt: number
      updatedAt: number
    }
  }
}

export { }
