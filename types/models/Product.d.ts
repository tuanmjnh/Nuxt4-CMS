export { }

declare global {
  namespace Models {


    interface ProductVariant {
      sku: string
      price: number
      salePrice?: number
      stock: number
      attributes: {
        name: string
        value: string
      }[]
      image?: string | Cloudinary.IFileAttach
    }

    interface Product {
      _id: string
      name: string
      slug: string
      description?: string
      shortDescription?: string
      price: number
      salePrice?: number
      costPrice?: number
      image: Cloudinary.IFileAttach
      images: Cloudinary.IFileAttach[]
      sku?: string
      barcode?: string
      stock: number
      manageStock: boolean
      lowStockThreshold?: number
      isUnlimitedStock?: boolean

      categories: (Category | string)[]
      tags: (Taxonomy | string)[]

      type: 'simple' | 'variable'
      status: 'draft' | 'published' | 'archived'

      attributes: {
        name: string
        options: string[]
        visible: boolean
        variation: boolean
      }[]

      variants: ProductVariant[]

      // SEO
      metaTitle?: string
      metaDescription?: string
      keywords?: string[]
      ogImage?: string

      // Stats
      sales: number
      views: number
      ratingCount: number
      ratingAverage: number
      isDeleted: boolean
      deletedAt?: number

      createdAt: number
      updatedAt: number
      history: IChangeData | null
    }
  }
}
