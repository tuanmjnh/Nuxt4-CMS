import mongoose, { Schema, Document } from 'mongoose'

export interface IAdminRouteDocument extends Document {
  path: string
  name: string
  icon?: string
  sortOrder: number
  isVisible: boolean
  parent?: mongoose.Types.ObjectId
}

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
  sortOrder: {
    type: Number,
    default: 0
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'AdminRoute'
  }
}, {
  timestamps: true
})

export const AdminRoute = mongoose.models.AdminRoute || mongoose.model<IAdminRouteDocument>('AdminRoute', AdminRouteSchema)
