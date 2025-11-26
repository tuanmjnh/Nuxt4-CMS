/// <reference path="../../types/index.d.ts" />
import mongoose, { Schema, Document } from 'mongoose'


export interface IMenuDocument extends Omit<Models.Menu, '_id' | 'createdAt' | 'updatedAt'>, Document { }

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
  }
}, {
  timestamps: true
})

// Indexes
MenuSchema.index({ position: 1, isActive: 1 })

// Auto-generate slug from name if not provided
// Auto-generate slug from name if not provided
MenuSchema.pre('validate', function (next) {
  const doc = this as unknown as IMenuDocument
  if (!doc.slug && doc.name) {
    doc.slug = doc.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
  next()
})

export const Menu: mongoose.Model<IMenuDocument> = mongoose.models.Menu || mongoose.model<IMenuDocument>('Menu', MenuSchema)
