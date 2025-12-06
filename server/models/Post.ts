/// <reference path="../../types/index.d.ts" />
import mongoose, { Schema, Document, Types } from 'mongoose'
import { ChangeDataSchema } from './Schemas'

export interface IPostDocument extends Omit<Models.Post, '_id'>, Document { }

const PostSchema = new Schema<IPostDocument>({
  type: {
    type: String,
    enum: ['post', 'page', 'product', 'project', 'service'],
    default: 'post'
  },
  format: {
    type: String,
    enum: ['standard', 'gallery', 'video', 'audio', 'quote', 'link'],
    default: 'standard'
  },
  title: {
    en: { type: String, required: true },
    vi: { type: String, required: true }
  },
  slug: {
    en: { type: String, required: true, unique: true, lowercase: true, trim: true },
    vi: { type: String, required: true, unique: true, lowercase: true, trim: true }
  },
  content: {
    en: { type: String, required: true },
    vi: { type: String, required: true }
  },
  excerpt: {
    en: { type: String, trim: true },
    vi: { type: String, trim: true }
  },
  thumbnail: {
    type: Object,// Supports both string and Cloudinary.IFileAttach
    default: null
  },
  // Gallery format
  gallery: [{
    type: Object, // Supports both string and Cloudinary.IFileAttach
    default: null
  }],
  // Unified media structure for video, audio, iframe, etc.
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
  // Quote format
  quoteText: {
    type: String
  },
  quoteAuthor: {
    type: String
  },
  // Link format
  linkUrl: {
    type: String
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'categories'
  }],
  tags: [{
    type: Schema.Types.ObjectId,
    ref: 'keywords'
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'scheduled', 'archived'],
    default: 'draft'
  },
  attributes: [{
    name: String,
    value: String
  }],

  // SEO fields
  metaTitle: String,
  metaDescription: String,
  keywords: [String],
  ogImage: String,

  // Stats
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  ratingAverage: {
    type: Number,
    default: 0
  },

  // Publishing
  publishedAt: Number,
  scheduledAt: Number,
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

// Indexes for search and filtering
PostSchema.index({
  'title.en': 'text',
  'title.vi': 'text',
  'content.en': 'text',
  'content.vi': 'text',
  'excerpt.en': 'text',
  'excerpt.vi': 'text'
})
PostSchema.index({ type: 1, status: 1, publishedAt: -1 })
PostSchema.index({ author: 1 })
PostSchema.index({ categories: 1 })
PostSchema.index({ tags: 1 })
PostSchema.index({ keywords: 1 })

// Auto-generate slug from title if not provided
PostSchema.pre('save', function (next) {
  const post = this as unknown as Models.Post

  // Handle localized titles and slugs
  if (post.title && typeof post.title === 'object') {
    if (!post.slug) post.slug = { en: '', vi: '' }

    // Generate EN slug
    if (typeof post.slug === 'object' && !post.slug.en && post.title.en) {
      post.slug.en = toSlug(post.title.en)
    }

    // Generate VI slug
    if (typeof post.slug === 'object' && !post.slug.vi && post.title.vi) {
      post.slug.vi = toSlug(post.title.vi)
    }
  }

  next()
})

export const Post: mongoose.Model<IPostDocument> = mongoose.models.posts || mongoose.model<IPostDocument>('posts', PostSchema)
