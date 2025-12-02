/// <reference path="../../types/index.d.ts" />
import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IMenuItemDocument extends Omit<Models.MenuItem, '_id' | 'createdAt' | 'updatedAt'>, Document { }

const MenuItemSchema = new Schema<IMenuItemDocument>({
  menu: {
    type: Schema.Types.ObjectId,
    ref: 'Menu',
    required: true
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'MenuItem',
    default: null
  },

  label: {
    type: String,
    required: true,
    trim: true
  },
  linkType: {
    type: String,
    enum: ['url', 'post', 'product', 'category', 'tag', 'page'],
    required: true
  },

  // Link targets
  url: String,
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product'
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  tag: {
    type: Schema.Types.ObjectId,
    ref: 'Tag'
  },

  // Display options
  target: {
    type: String,
    enum: ['_self', '_blank'],
    default: '_self'
  },
  icon: String,
  cssClass: String,

  // Visibility
  isVisible: {
    type: Boolean,
    default: true
  },

  // Ordering
  sortOrder: {
    type: Number,
    default: 0
  },
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
MenuItemSchema.index({ menu: 1, sortOrder: 1 })
MenuItemSchema.index({ parent: 1, sortOrder: 1 })

export const MenuItem: mongoose.Model<IMenuItemDocument> = mongoose.models.MenuItem || mongoose.model<IMenuItemDocument>('MenuItem', MenuItemSchema)
