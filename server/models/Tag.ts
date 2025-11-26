/// <reference path="../../types/index.d.ts" />
import mongoose, { Schema, Document } from 'mongoose'


export interface ITagDocument extends Omit<Models.Tag, '_id' | 'createdAt' | 'updatedAt'>, Document { }

const TagSchema = new Schema<ITagDocument>({
  name: {
    type: String,
    required: true,
    unique: true
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
  color: {
    type: String,
    default: '#3B82F6' // Default blue color
  },

  // Stats
  postCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Indexes

// Auto-generate slug from name if not provided
// Auto-generate slug from name if not provided
TagSchema.pre('save', function (next) {
  const doc = this as unknown as ITagDocument
  if (!doc.slug && doc.name) {
    doc.slug = doc.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
  next()
})

export const Tag: mongoose.Model<ITagDocument> = mongoose.models.Tag || mongoose.model<ITagDocument>('Tag', TagSchema)
