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
      deletedAt?: number
      items?: MenuItem[] // Virtual populated
      createdAt: number
      updatedAt: number
      history: IChangeData | null
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
      deletedAt?: number
      children?: MenuItem[] // Virtual populated
      createdAt: number
      updatedAt: number
      history: IChangeData | null
    }
  }
}
