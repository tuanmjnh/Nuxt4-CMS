/// <reference path="../../types/index.d.ts" />
import mongoose, { Schema, Document } from 'mongoose'


export interface ICategoryDocument extends Omit<Models.Category, '_id' | 'createdAt' | 'updatedAt'>, Document { }

const CategorySchema = new Schema<ICategoryDocument>({
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
  description: {
    type: String,
    trim: true
  },
  image: {
    type: Object, // Supports both string and Cloudinary.IFileAttach
    default: null
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },

  // SEO fields
  metaTitle: String,
  metaDescription: String,

  // Stats
  postCount: {
    type: Number,
    default: 0
  },
  type: {
    type: String,
    enum: ['post', 'product', 'user'],
    default: 'post'
  }
}, {
  timestamps: true
})

// Indexes
CategorySchema.index({ parent: 1 })
CategorySchema.index({ type: 1 })

// Auto-generate slug from name if not provided
// Auto-generate slug from name if not provided
CategorySchema.pre('validate', function (next) {
  const doc = this as unknown as ICategoryDocument
  if (!doc.slug && doc.name) {
    doc.slug = doc.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
  next()
})

export const Category: mongoose.Model<ICategoryDocument> = mongoose.models.Category || mongoose.model<ICategoryDocument>('Category', CategorySchema)
