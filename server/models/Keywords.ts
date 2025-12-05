/// <reference path="../../types/index.d.ts" />
import mongoose, { Schema, Document } from 'mongoose'

export interface IKeywordsDocument extends Omit<Models.Keywords, '_id'>, Document { }

const KeywordsSchema = new Schema<IKeywordsDocument>({
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
  type: {
    type: String,
    enum: ['tag', 'keyword'],
    default: 'tag',
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    default: '#3B82F6' // Default blue color
  },
  // Stats
  count: {
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
  createdAt: { type: Number },
  updatedAt: { type: Number }
}, {
  timestamps: { currentTime: () => Date.now() }
})

// Indexes
KeywordsSchema.index({ type: 1 })

KeywordsSchema.index({ name: 'text', slug: 'text' })

// Auto-generate slug from name if not provided
KeywordsSchema.pre('validate', function (next) {
  const doc = this as unknown as IKeywordsDocument
  if (!doc.slug && doc.name) doc.slug = toSlug(doc.name)
  next()
})

export const Keywords: mongoose.Model<IKeywordsDocument> =
  mongoose.models.keywords || mongoose.model<IKeywordsDocument>('keywords', KeywordsSchema)
