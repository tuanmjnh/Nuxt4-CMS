/// <reference path="../../types/index.d.ts" />
import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IProductDocument extends Omit<Models.Product, '_id' | 'createdAt' | 'updatedAt'>, Document { }

const VariantSchema = new Schema({
  sku: String,
  price: { type: Number, required: true },
  salePrice: Number,
  stock: { type: Number, default: 0 },
  attributes: [{
    name: String,
    value: String
  }],
  image: { type: Object, default: null } // Supports both string and Cloudinary.IFileAttach
})

const ProductSchema = new Schema<IProductDocument>({
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
  description: String,
  shortDescription: String,
  type: {
    type: String,
    enum: ['simple', 'variable'],
    default: 'simple'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },

  // Simple product fields
  price: Number,
  salePrice: Number,
  sku: String,
  stock: {
    type: Number,
    default: 0
  },
  manageStock: {
    type: Boolean,
    default: true
  },
  lowStockThreshold: Number,
  isUnlimitedStock: Boolean,
  costPrice: Number,
  barcode: String,

  image: { type: Object, default: null }, // Supports both string and Cloudinary.IFileAttach
  images: [{
    type: Object, // Supports both string and Cloudinary.IFileAttach
    default: null
  }],

  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  tags: [{
    type: Schema.Types.ObjectId,
    ref: 'Tag'
  }],

  attributes: [{
    name: String,
    options: [String],
    visible: { type: Boolean, default: true },
    variation: { type: Boolean, default: false }
  }],

  variants: [VariantSchema],

  metaTitle: String,
  metaDescription: String,
  keywords: [String],
  ogImage: String,

  views: { type: Number, default: 0 },
  sales: { type: Number, default: 0 },
  ratingAverage: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
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

// Indexes
ProductSchema.index({ name: 'text', description: 'text' })
ProductSchema.index({ categories: 1 })
ProductSchema.index({ tags: 1 })
ProductSchema.index({ status: 1 })
ProductSchema.index({ price: 1 })

// Auto-generate slug
ProductSchema.pre('validate', function (next) {
  const doc = this as unknown as IProductDocument
  if (!doc.slug && doc.name) doc.slug = toSlug(doc.name)
  next()
})

export const Product: mongoose.Model<IProductDocument> = mongoose.models.Product || mongoose.model<IProductDocument>('Product', ProductSchema)
