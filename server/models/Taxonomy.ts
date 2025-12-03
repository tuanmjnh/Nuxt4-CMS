/// <reference path="../../types/index.d.ts" />
import mongoose, { Schema, Document } from 'mongoose'

export interface ITaxonomyDocument extends Omit<Models.Taxonomy, '_id'>, Document { }

const TaxonomySchema = new Schema<ITaxonomyDocument>({
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
TaxonomySchema.index({ type: 1 })

TaxonomySchema.index({ name: 'text', slug: 'text' })

// Auto-generate slug from name if not provided
TaxonomySchema.pre('validate', function (next) {
  const doc = this as unknown as ITaxonomyDocument
  if (!doc.slug && doc.name) doc.slug = toSlug(doc.name)
  next()
})

export const Taxonomy: mongoose.Model<ITaxonomyDocument> =
  mongoose.models.taxonomies || mongoose.model<ITaxonomyDocument>('taxonomies', TaxonomySchema)
