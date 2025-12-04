import mongoose, { Document, Schema } from 'mongoose'
import { ChangeDataSchema } from './Schemas'

const inventoryTransactionSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  type: {
    type: String,
    enum: ['import', 'export', 'transfer'],
    required: true
  },
  warehouse: {
    type: Schema.Types.ObjectId,
    ref: 'warehouses',
    required: true
  },
  toWarehouse: {
    type: Schema.Types.ObjectId,
    ref: 'warehouses',
    default: null // Only for transfer
  },
  items: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'products',
      required: true
    },
    variantSku: {
      type: String,
      default: null
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      default: 0
    }
  }],
  totalAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  note: {
    type: String,
    default: ''
  },
  reference: {
    type: String,
    default: ''
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  history: { type: ChangeDataSchema, default: null },
  createdAt: { type: Number },
  updatedAt: { type: Number }
}, {
  timestamps: { currentTime: () => Date.now() }
})

export interface IInventoryTransactionDocument extends Omit<Models.InventoryTransaction, '_id'>, Document { }

export const InventoryTransaction = mongoose.models.inventory_transactions || mongoose.model<IInventoryTransactionDocument>('inventory_transactions', inventoryTransactionSchema)
