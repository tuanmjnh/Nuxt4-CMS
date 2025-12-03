import mongoose, { Schema, Document } from 'mongoose'
import { ChangeDataSchema } from './Schemas'

export interface IAdminRouteDocument extends Omit<Models.AdminRoute, '_id'>, Document { }

const AdminRouteSchema = new Schema<IAdminRouteDocument>({
  path: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    trim: true
  },
  sort: {
    type: Number,
    default: 0
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'admin_routes'
  },
  history: { type: ChangeDataSchema, default: null },
  createdAt: { type: Number },
  updatedAt: { type: Number }
}, {
  timestamps: { currentTime: () => Date.now() }
})

export const AdminRoute = mongoose.models.admin_routes || mongoose.model<IAdminRouteDocument>('admin_routes', AdminRouteSchema)
