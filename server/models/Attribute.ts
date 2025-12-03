/// <reference path="../../types/index.d.ts" />
import mongoose, { Schema, Document } from 'mongoose'
import { ChangeDataSchema } from './Schemas'

export interface IAttributeDocument extends Omit<Models.Attribute, '_id'>, Document { }

const AttributeSchema = new Schema<IAttributeDocument>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['post', 'product'],
    index: true
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
    type: Number,
    default: null
  },
  history: { type: ChangeDataSchema, default: null },
  createdAt: { type: Number },
  updatedAt: { type: Number }
}, {
  timestamps: { currentTime: () => Date.now() }
})

// Compound index for unique name per type
AttributeSchema.index({ name: 1, type: 1 }, { unique: true })
AttributeSchema.index({ slug: 1, type: 1 }, { unique: true })

// Auto-generate slug from name if not provided
AttributeSchema.pre('validate', function (next) {
  const doc = this as unknown as IAttributeDocument
  if (!doc.slug && doc.name) doc.slug = toSlug(doc.name)
  next()
})

export const Attribute: mongoose.Model<IAttributeDocument> =
  mongoose.models.attributes || mongoose.model<IAttributeDocument>('attributes', AttributeSchema)
