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

      // Stats
      postCount: number

      createdAt: string | Date
      updatedAt: string | Date
    }
  }
}