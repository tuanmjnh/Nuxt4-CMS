import mongoose, { Document } from 'mongoose'
import { ChangeDataSchema } from './Schemas'

const warehouseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  address: {
    type: String,
    default: ''
  },
  manager: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  description: {
    type: String,
    default: ''
  },
  history: { type: ChangeDataSchema, default: null },
  createdAt: { type: Number },
  updatedAt: { type: Number }
}, {
  timestamps: { currentTime: () => Date.now() }
})

export interface IWarehouseDocument extends Omit<Models.Warehouse, '_id'>, Document { }

export const Warehouse = mongoose.models.warehouses || mongoose.model<IWarehouseDocument>('warehouses', warehouseSchema)
