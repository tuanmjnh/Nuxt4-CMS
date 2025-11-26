/// <reference path="../../types/index.d.ts" />
import mongoose, { Schema, Document } from 'mongoose'


export interface IProductAttributeDocument extends Omit<Models.ProductAttribute, '_id' | 'createdAt' | 'updatedAt'>, Document { }

const ProductAttributeSchema = new Schema<IProductAttributeDocument>({
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
  }]
}, {
  timestamps: true
})

// Auto-generate slug from name if not provided
// Auto-generate slug from name if not provided
ProductAttributeSchema.pre('validate', function (next) {
  const doc = this as unknown as IProductAttributeDocument
  if (!doc.slug && doc.name) {
    doc.slug = doc.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
  next()
})

export const ProductAttribute: mongoose.Model<IProductAttributeDocument> = mongoose.models.ProductAttribute || mongoose.model<IProductAttributeDocument>('ProductAttribute', ProductAttributeSchema)
