declare global {
  namespace Models {
    export interface PaymentTransaction {
      amount: number
      type: 'in' | 'out'
      reference?: string // Inventory Transaction ID or Order ID
      method: 'cash' | 'bank_transfer' | 'card' | 'other'
      status: 'pending' | 'completed' | 'failed'
      note?: string
      createdBy?: string
      createdAt: number
      updatedAt: number
    }
  }
}

export { }
