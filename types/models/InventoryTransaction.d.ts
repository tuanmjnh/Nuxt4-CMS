declare global {
  namespace Models {
    export interface InventoryTransaction {
      _id: string
      code: string
      type: 'import' | 'export' | 'transfer'
      warehouse: string | Models.Warehouse
      toWarehouse?: string | Models.Warehouse | null
      items: {
        product: string | Models.Product
        variantSku?: string | null
        quantity: number
        price: number
      }[]
      totalAmount: number
      status: 'pending' | 'completed' | 'cancelled'
      note: string
      reference: string
      createdBy?: string | Models.User
      history: any
      createdAt: number
      updatedAt: number
    }
  }
}

export { }
