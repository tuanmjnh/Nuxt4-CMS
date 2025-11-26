export { }

declare global {
  namespace Models {
    interface Tag {
      _id: string
      name: string
      slug: string
      description?: string
      color?: string
      postCount: number
      createdAt: string | Date
      updatedAt: string | Date
    }

    interface PostMediaData {
      type: 'video' | 'audio' | 'iframe' | 'embed'
      url: string // Youtube/Vimeo link or MP4/MP3 file
      embedCode?: string // iframe embed code
      duration?: number // Duration (seconds)
      thumbnail?: Cloudinary.IFileAttach // Thumbnail image
      title?: string // Media title
    }

    interface Post {
      _id: string
      title: { en: string; vi: string } | string
      slug: string
      content: { en: string; vi: string } | string
      excerpt?: { en: string; vi: string } | string
      thumbnail?: Cloudinary.IFileAttach

      // Format-specific fields
      gallery?: Cloudinary.IFileAttach[]
      media?: PostMediaData[]
      quoteText?: string
      quoteAuthor?: string
      linkUrl?: string

      author: User | string
      categories: (Category | string)[]
      tags: (Tag | string)[]
      status: 'draft' | 'published' | 'scheduled' | 'archived'
      format: 'standard' | 'gallery' | 'video' | 'audio' | 'quote' | 'link'
      type: 'post' | 'page' | 'product' | 'project' | 'service'

      // SEO
      metaTitle?: string
      metaDescription?: string
      keywords?: string[]
      ogImage?: string

      // Stats
      views: number
      likes: number
      shares: number
      comments: number
      ratingCount: number
      ratingAverage: number

      publishedAt?: string | Date
      scheduledAt?: string | Date
      createdAt: string | Date
      updatedAt: string | Date
    }
  }
}
