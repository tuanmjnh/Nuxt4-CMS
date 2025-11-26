/// <reference path="../../types/index.d.ts" />
import mongoose, { Schema, Document, Types } from 'mongoose'


export interface IPostMediaData {
  type: 'video' | 'audio' | 'iframe' | 'embed'
  url: string // Youtube/Vimeo link or MP4/MP3 file
  embedCode?: string // iframe embed code
  duration?: number // Duration (seconds)
  thumbnail?: string // Thumbnail image
  title?: string // Media title
}

export interface IPostDocument extends Omit<Models.Post, '_id' | 'createdAt' | 'updatedAt'>, Document {
  gallery?: string[]
  media?: IPostMediaData[]
  quoteText?: string
  quoteAuthor?: string
  linkUrl?: string
}

const PostSchema = new Schema<IPostDocument>({
  title: {
    en: { type: String, required: true },
    vi: { type: String, required: true }
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
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
    ref: 'User',
    required: true
  },
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  tags: [{
    type: Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'scheduled', 'archived'],
    default: 'draft'
  },
  format: {
    type: String,
    enum: ['standard', 'gallery', 'video', 'audio', 'quote', 'link'],
    default: 'standard'
  },
  type: {
    type: String,
    enum: ['post', 'page', 'product', 'project', 'service'],
    default: 'post'
  },

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
  publishedAt: Date,
  scheduledAt: Date
}, {
  timestamps: true
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
PostSchema.index({ status: 1, publishedAt: -1 })
PostSchema.index({ author: 1 })
PostSchema.index({ categories: 1 })
PostSchema.index({ tags: 1 })

// Auto-generate slug from title (English) if not provided
PostSchema.pre('save', function (next) {
  const post = this as unknown as Models.Post
  if (!post.slug && post.title && typeof post.title === 'object' && 'en' in post.title && post.title.en) {
    post.slug = post.title.en
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
  next()
})

export const Post: mongoose.Model<IPostDocument> = mongoose.models.Post || mongoose.model<IPostDocument>('Post', PostSchema)
