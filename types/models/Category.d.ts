export { }

declare global {
  namespace Models {
    interface Category {
      _id: string
      name: string
      slug: string
      description?: string
      image?: Cloudinary.IFileAttach
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