/// <reference path="../../types/index.d.ts" />
import mongoose, { Schema, Document, Types } from 'mongoose'
import { ChangeDataSchema } from './Schemas'

export interface IMenuItemDocument extends Omit<Models.MenuItem, '_id'>, Document { }

const MenuItemSchema = new Schema<IMenuItemDocument>({
  menu: {
    type: Schema.Types.ObjectId,
    ref: 'menus',
    required: true
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'menu_items',
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
    ref: 'posts'
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'products'
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'categories'
  },
  tag: {
    type: Schema.Types.ObjectId,
    ref: 'taxonomies'
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
MenuItemSchema.index({ menu: 1, sortOrder: 1 })
MenuItemSchema.index({ parent: 1, sortOrder: 1 })

export const MenuItem: mongoose.Model<IMenuItemDocument> =
  mongoose.models.menu_items || mongoose.model<IMenuItemDocument>('menu_items', MenuItemSchema)
