/// <reference path="../../types/index.d.ts" />
import mongoose, { Schema, Document } from 'mongoose'


export interface IRoleDocument extends Omit<Models.Role, '_id' | 'createdAt' | 'updatedAt'>, Document { }

const RoleSchema = new Schema<IRoleDocument>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  permissions: [{
    type: String,
    trim: true
  }],
  allowedRoutes: [{
    type: Schema.Types.ObjectId,
    ref: 'AdminRoute'
  }],
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

export const Role: mongoose.Model<IRoleDocument> = mongoose.models.Role || mongoose.model<IRoleDocument>('Role', RoleSchema)
