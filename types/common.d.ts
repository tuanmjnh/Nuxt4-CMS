export { }

declare global {
  export type PeriodType = 'daily' | 'weekly' | 'monthly'

  export interface RangeType {
    start: Date
    end: Date
  }

  namespace Common {
    export interface IFileAttach extends Cloudinary.IFileAttach { }

    export interface ISocialData {
      facebook?: string
      twitter?: string
      instagram?: string
      linkedin?: string
      youtube?: string
      tiktok?: string
      zalo?: string
    }

    export interface ISeoData {
      title?: string
      description?: string
      keywords?: string[]
      image?: IFileAttach
    }

    export interface IChangeData {
      at: number
      by: string
      ip: string | null
    }
  }

  namespace Models {
    interface Response<T> {
      success: boolean
      data: T
      message?: string
    }

    interface IChangeData {
      at: number
      by: string
      ip: string | null
    }

    interface Pagination {
      page: number
      limit: number
      total: number
      totalPages: number
    }

    interface ListResponse<T> {
      success: boolean
      data: {
        items: T[]
        pagination: Pagination
      }
      message?: string
    }

    // Auth related types
    interface AuthTokens {
      accessToken: string
      refreshToken: string
    }

    interface AuthResponse {
      success: boolean
      data: {
        user: UserWithRoles
        accessToken: string
        refreshToken: string
      }
      message?: string
    }

    interface UserResponse {
      success: boolean
      data: {
        user: UserWithRoles
      }
      message?: string
    }

    // Helper types for populated fields
    interface UserWithRoles extends Omit<User, 'roles'> {
      roles: Role[]
    }

    interface RoleWithRoutes extends Omit<Role, 'allowedRoutes'> {
      allowedRoutes: AdminRoute[]
    }

    interface UserWithRoleAndRoutes extends Omit<User, 'roles'> {
      roles: RoleWithRoutes[]
    }

    interface PostPopulated extends Omit<Post, 'author' | 'categories' | 'tags'> {
      author: User
      categories: Category[]
      tags: Tag[]
    }

    interface MenuItemPopulated extends Omit<MenuItem, 'menu' | 'parent' | 'post' | 'product' | 'category' | 'tag'> {
      menu?: Menu
      parent?: MenuItem
      post?: Post
      product?: Product
      category?: Category
      tag?: Tag
      children?: MenuItemPopulated[]
    }

    interface MenuWithItems {
      menu: Menu
      items: MenuItemPopulated[]
    }

    // Create/Update types (Partial without readonly fields)
    type CreateUser = Omit<User, '_id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'deletedAt'>
    type UpdateUser = Partial<Omit<User, '_id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'deletedAt'>>

    type CreatePost = Omit<Post, '_id' | 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'shares' | 'comments' | 'ratingCount' | 'ratingAverage' | 'isDeleted' | 'deletedAt' | 'history'>
    type UpdatePost = Partial<CreatePost>

    type CreateMenu = Omit<Menu, '_id' | 'createdAt' | 'updatedAt' | 'items' | 'slug' | 'sortOrder' | 'isDeleted' | 'deletedAt' | 'history'> & {
      slug?: string
      sortOrder?: number
    }
    type UpdateMenu = Partial<CreateMenu>

    type CreateMenuItem = Omit<MenuItem, '_id' | 'createdAt' | 'updatedAt' | 'children' | 'isDeleted' | 'deletedAt' | 'history'>
    type UpdateMenuItem = Partial<CreateMenuItem>

    type CreateCategory = Omit<Category, '_id' | 'createdAt' | 'updatedAt' | 'postCount' | 'isDeleted' | 'deletedAt'>
    type UpdateCategory = Partial<CreateCategory>

    type CreateProduct = Omit<Product, '_id' | 'createdAt' | 'updatedAt' | 'sales' | 'views' | 'ratingCount' | 'ratingAverage' | 'isDeleted' | 'deletedAt'>
    type UpdateProduct = Partial<CreateProduct>

    // Query params types
    interface PostQueryParams {
      page?: number
      limit?: number
      status?: Post['status']
      type?: Post['type']
      format?: Post['format']
      author?: string
      category?: string
      tag?: string
      search?: string
      sort?: string
    }

    interface ProductQueryParams {
      page?: number
      limit?: number
      status?: Product['status']
      type?: Product['type']
      category?: string
      tag?: string
      search?: string
      minPrice?: number
      maxPrice?: number
      inStock?: boolean
      sort?: string
    }

    interface UserQueryParams {
      page?: number
      limit?: number
      role?: string
      isActive?: boolean
      search?: string
      sort?: string
    }
  }
}
