import mongoose, { Schema, Document } from 'mongoose'
import { ChangeDataSchema } from './Schemas'

export interface ISystemRouteDocument extends Omit<Models.SystemRoute, '_id'>, Document { }

const SystemRouteSchema = new Schema<ISystemRouteDocument>({
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
    ref: 'system_routes'
  },
  history: { type: ChangeDataSchema, default: null },
  createdAt: { type: Number },
  updatedAt: { type: Number }
}, {
  timestamps: { currentTime: () => Date.now() }
})

export const SystemRoute = mongoose.models.system_routes || mongoose.model<ISystemRouteDocument>('system_routes', SystemRouteSchema)
