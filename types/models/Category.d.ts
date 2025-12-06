export { }

declare global {
  namespace Models {
    interface Category {
      _id: string
      title: { en: string; vi: string } | string
      slug: { en: string; vi: string } | string
      description?: { en: string; vi: string } | string
      thumbnail?: Cloudinary.IFileAttach
      gallery?: Cloudinary.IFileAttach[]
      parent?: Category | string
      type: 'post' | 'product' | 'user'

      // SEO
      metaTitle?: string
      metaDescription?: string
      keywords?: string[]
      tags?: (Taxonomy | string)[]
      ogImage?: string

      // Stats
      postCount: number
      sortOrder: number
      isDeleted: boolean
      deletedAt?: number
      createdAt: number
      updatedAt: number
      history: IChangeData | null
    }
  }
}