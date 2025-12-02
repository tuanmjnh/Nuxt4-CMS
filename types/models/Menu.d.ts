export { }

declare global {
  namespace Models {
    interface Menu {
      _id: string
      name: string
      slug: string
      position: string
      isActive: boolean
      sortOrder: number
      isDeleted: boolean
      deletedAt?: string | Date
      items?: MenuItem[] // Virtual populated
      createdAt: string | Date
      updatedAt: string | Date
    }

    interface MenuItem {
      _id: string
      menu: Menu | string
      parent?: MenuItem | string
      label: string
      linkType: 'url' | 'post' | 'category' | 'tag' | 'page' | 'product'
      url?: string
      post?: Post | string
      product?: Product | string
      category?: Category | string
      tag?: Tag | string
      target: '_self' | '_blank'
      icon?: string
      cssClass?: string
      isVisible: boolean
      sortOrder: number
      isDeleted: boolean
      deletedAt?: string | Date
      children?: MenuItem[] // Virtual populated
      createdAt: string | Date
      updatedAt: string | Date
    }
  }
}
