export { }

declare global {
  namespace Models {
    interface Post {
      _id: string
      // Type-specific fields
      type: 'post' | 'page' | 'product' | 'project' | 'service'
      format: 'standard' | 'gallery' | 'video' | 'audio' | 'quote' | 'link'
      // Common fields
      title: { en: string; vi: string } | string
      slug: string
      content: { en: string; vi: string } | string
      excerpt?: { en: string; vi: string } | string
      featuredImage?: string
      thumbnail?: Cloudinary.IFileAttach
      // Format-specific fields
      gallery?: Cloudinary.IFileAttach[]
      media?: Common.IPostMediaData[]
      quoteText?: string
      quoteAuthor?: string
      linkUrl?: string

      attributes?: {
        name: string
        value: string
      }[]

      author: User | string
      categories: (Category | string)[]
      tags: (Taxonomy | string)[]
      status: 'draft' | 'published' | 'scheduled' | 'archived'

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
      isDeleted: boolean
      deletedAt?: number
      publishedAt?: number
      scheduledAt?: number
      createdAt: number
      updatedAt: number
      history: IChangeData | null
    }
  }
}
