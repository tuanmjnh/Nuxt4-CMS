/// <reference path="../../types/index.d.ts" />
import mongoose, { Schema, Document } from 'mongoose'
import { ChangeDataSchema } from './Schemas'

export interface ICategoryDocument extends Omit<Models.Category, '_id'>, Document { }

const CategorySchema = new Schema<ICategoryDocument>({
  title: {
    en: { type: String, required: true, trim: true },
    vi: { type: String, required: true, trim: true }
  },
  slug: {
    en: { type: String, required: true, unique: true, lowercase: true, trim: true },
    vi: { type: String, required: true, unique: true, lowercase: true, trim: true }
  },
  description: {
    en: { type: String, trim: true },
    vi: { type: String, trim: true }
  },
  thumbnail: {
    type: Object, // Supports both string and Cloudinary.IFileAttach
    default: null
  },
  gallery: [{
    type: Object, // Supports both string and Cloudinary.IFileAttach
    default: null
  }],
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'categories',
    default: null
  },

  // SEO fields
  metaTitle: { en: String, vi: String },
  metaDescription: { en: String, vi: String },
  keywords: [String],
  tags: [{
    type: Schema.Types.ObjectId,
    ref: 'keywords'
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
CategorySchema.index({
  'title.en': 'text',
  'title.vi': 'text',
  'description.en': 'text',
  'description.vi': 'text'
})

// Auto-generate slug from title if not provided
CategorySchema.pre('validate', function (next) {
  const doc = this as unknown as ICategoryDocument

  if (doc.title && typeof doc.title === 'object') {
    if (!doc.slug) doc.slug = { en: '', vi: '' }

    // Generate EN slug
    if (typeof doc.slug === 'object' && !doc.slug.en && doc.title.en) {
      doc.slug.en = toSlug(doc.title.en)
    }

    // Generate VI slug
    if (typeof doc.slug === 'object' && !doc.slug.vi && doc.title.vi) {
      doc.slug.vi = toSlug(doc.title.vi)
    }
  }
  next()
})

export const Category: mongoose.Model<ICategoryDocument> =
  mongoose.models.categories || mongoose.model<ICategoryDocument>('categories', CategorySchema)
