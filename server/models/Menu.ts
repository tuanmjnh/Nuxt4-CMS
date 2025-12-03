/// <reference path="../../types/index.d.ts" />
import mongoose, { Schema, Document } from 'mongoose'
import { ChangeDataSchema } from './Schemas'

export interface IMenuDocument extends Omit<Models.Menu, '_id'>, Document { }

const MenuSchema = new Schema<IMenuDocument>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  position: {
    type: String,
    enum: ['header', 'footer', 'sidebar', 'mobile', 'custom'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Number,
    default: null
  },
  history: { type: ChangeDataSchema, default: null },
  createdAt: { type: Number },
  updatedAt: { type: Number }
}, {
  timestamps: { currentTime: () => Date.now() }
})

// Indexes
MenuSchema.index({ position: 1, isActive: 1 })

// Auto-generate slug from name if not provided
// Auto-generate slug from name if not provided
MenuSchema.pre('validate', function (next) {
  const doc = this as unknown as IMenuDocument
  if (!doc.slug && doc.name) doc.slug = toSlug(doc.name)
  // .toLowerCase()
  // .replace(/[^a-z0-9]+/g, '-')
  // .replace(/^-+|-+$/g, '')
  next()
})

export const Menu: mongoose.Model<IMenuDocument> =
  mongoose.models.menus || mongoose.model<IMenuDocument>('menus', MenuSchema)
