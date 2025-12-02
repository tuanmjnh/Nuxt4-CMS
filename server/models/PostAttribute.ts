/// <reference path="../../types/index.d.ts" />
import mongoose, { Schema, Document } from 'mongoose'

export interface IPostAttributeDocument extends Document {
  name: string
  slug: string
  values: string[]
  isDeleted: boolean
  deletedAt: Date | null
  createdAt?: Date
  updatedAt?: Date
}

const PostAttributeSchema = new Schema<IPostAttributeDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  values: [{
    type: String,
    trim: true
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
})

// Auto-generate slug from name if not provided
PostAttributeSchema.pre('validate', function (next) {
  const doc = this as unknown as IPostAttributeDocument
  if (!doc.slug && doc.name) doc.slug = toSlug(doc.name)
  next()
})

export const PostAttribute: mongoose.Model<IPostAttributeDocument> = mongoose.models.PostAttribute || mongoose.model<IPostAttributeDocument>('PostAttribute', PostAttributeSchema)
