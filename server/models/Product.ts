/// <reference path="../../types/index.d.ts" />
import mongoose, { Schema, Document, Types } from 'mongoose'
import { ChangeDataSchema } from './Schemas'

export interface IProductDocument extends Omit<Models.Product, '_id'>, Document { }

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
    en: { type: String, required: true, trim: true },
    vi: { type: String, required: true, trim: true }
  },
  slug: {
    en: { type: String, required: true, unique: true, lowercase: true, trim: true },
    vi: { type: String, required: true, unique: true, lowercase: true, trim: true }
  },
  desc: { en: String, vi: String },
  shortDesc: { en: String, vi: String },
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
  warehouseStock: [{
    warehouse: {
      type: Schema.Types.ObjectId,
      ref: 'warehouses'
    },
    quantity: {
      type: Number,
      default: 0
    }
  }],
  manageStock: {
    type: Boolean,
    default: true
  },
  lowStockThreshold: Number,
  isUnlimitedStock: Boolean,
  costPrice: Number,
  barcode: String,

  thumbnail: { type: Object, default: null }, // Supports both string and Cloudinary.IFileAttach
  gallery: [{
    type: Object, // Supports both string and Cloudinary.IFileAttach
    default: null
  }],
  media: [{
    type: {
      type: String,
      enum: ['video', 'audio', 'iframe', 'embed'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    embedCode: String,
    duration: Number,
    thumbnail: { type: Object, default: null }, // Supports both string and Cloudinary.IFileAttach
    title: String
  }],
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'categories'
  }],
  tags: [{
    type: Schema.Types.ObjectId,
    ref: 'keywords'
  }],

  attributes: [{
    name: String,
    options: [String],
    visible: { type: Boolean, default: true },
    variation: { type: Boolean, default: false }
  }],

  variants: [VariantSchema],

  metaTitle: { en: String, vi: String },
  metaDescription: { en: String, vi: String },
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
ProductSchema.index({
  'name.en': 'text',
  'name.vi': 'text',
  'desc.en': 'text',
  'desc.vi': 'text'
})
ProductSchema.index({ categories: 1 })
ProductSchema.index({ tags: 1 })
ProductSchema.index({ keywords: 1 })
ProductSchema.index({ status: 1 })
ProductSchema.index({ price: 1 })

// Auto-generate slug
ProductSchema.pre('validate', function (next) {
  const doc = this as unknown as IProductDocument

  if (doc.name && typeof doc.name === 'object') {
    if (!doc.slug) doc.slug = { en: '', vi: '' }

    // Generate EN slug
    if (typeof doc.slug === 'object' && !doc.slug.en && doc.name.en) {
      doc.slug.en = toSlug(doc.name.en)
    }

    // Generate VI slug
    if (typeof doc.slug === 'object' && !doc.slug.vi && doc.name.vi) {
      doc.slug.vi = toSlug(doc.name.vi)
    }
  }
  next()
})

export const Product: mongoose.Model<IProductDocument> =
  mongoose.models.products || mongoose.model<IProductDocument>('products', ProductSchema)
