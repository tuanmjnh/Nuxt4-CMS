/// <reference path="../../types/index.d.ts" />
import mongoose, { Schema, Document } from 'mongoose'
import { ChangeDataSchema } from './Schemas'

export interface ICategoryDocument extends Omit<Models.Category, '_id'>, Document { }

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
    ref: 'categories',
    default: null
  },

  // SEO fields
  metaTitle: String,
  metaDescription: String,
  keywords: [String],
  tags: [{
    type: Schema.Types.ObjectId,
    ref: 'taxonomies'
  }],
  ogImage: String,

  // Stats
  postCount: {
    type: Number,
    default: 0
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  type: {
    type: String,
    enum: ['post', 'product', 'user'],
    default: 'post'
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
CategorySchema.index({ parent: 1 })
CategorySchema.index({ type: 1 })
CategorySchema.index({ tags: 1 })
CategorySchema.index({ keywords: 1 })

// Auto-generate slug from name if not provided
// Auto-generate slug from name if not provided
CategorySchema.pre('validate', function (next) {
  const doc = this as unknown as ICategoryDocument
  if (!doc.slug && doc.name) doc.slug = toSlug(doc.name)
  next()
})

export const Category: mongoose.Model<ICategoryDocument> =
  mongoose.models.categories || mongoose.model<ICategoryDocument>('categories', CategorySchema)
