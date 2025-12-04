import { SystemRoute } from '../models/SystemRoute'
import { Role } from '../models/Role'
import { User } from '../models/User'
import { Category } from '../models/Category'

export default defineNitroPlugin(async (nitroApp) => {
  try {
    await connectDB()
    console.log('Starting seed process...')

    // 1. Seed Admin Routes
    await seedRoutes()

    // 2. Seed Roles
    const roles = await seedRoles()

    // 3. Seed Users & Categories
    await seedUsers(roles)

    console.log('Seeding completed successfully')
  } catch (error) {
    console.error('Error seeding:', error)
  }
})

async function seedRoutes() {
  const routes = [
    {
      name: 'dashboard',
      path: '/admin',
      icon: 'i-lucide-layout-dashboard',
      sort: 1
    },
    {
      name: 'posts',
      path: '/admin/posts',
      icon: 'i-lucide-file-text',
      sort: 2,
      isVisible: true,
      children: [
        { name: 'View', path: '/admin/posts/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
        { name: 'Create', path: '/admin/posts/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
        { name: 'Edit', path: '/admin/posts/[id]', icon: 'i-lucide-file-pen', sort: 3, isVisible: false },
        { name: 'Delete', path: '/admin/posts/delete', icon: 'i-lucide-file-minus', sort: 4, isVisible: false }
      ]
    },
    {
      name: 'categories',
      path: '/admin/categories',
      icon: 'i-lucide-folder',
      sort: 3,
      isVisible: true,
      children: [
        { name: 'View', path: '/admin/categories/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
        { name: 'Create', path: '/admin/categories/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
        { name: 'Edit', path: '/admin/categories/[id]', icon: 'i-lucide-file-pen', sort: 3, isVisible: false },
        { name: 'Delete', path: '/admin/categories/delete', icon: 'i-lucide-file-minus', sort: 4, isVisible: false }
      ]
    },
    {
      name: 'menus',
      path: '/admin/menus',
      icon: 'i-lucide-menu',
      sort: 4,
      isVisible: true,
      children: [
        { name: 'View', path: '/admin/menus/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
        { name: 'Create', path: '/admin/menus/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
        { name: 'Edit', path: '/admin/menus/[id]', icon: 'i-lucide-file-pen', sort: 3, isVisible: false },
        { name: 'Delete', path: '/admin/menus/delete', icon: 'i-lucide-file-minus', sort: 4, isVisible: false }
      ]
    },
    {
      name: 'media',
      path: '/admin/media',
      icon: 'i-lucide-image',
      sort: 5,
      isVisible: true,
      children: [
        { name: 'View', path: '/admin/media/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
        { name: 'Create', path: '/admin/media/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
        { name: 'Delete', path: '/admin/media/delete', icon: 'i-lucide-file-minus', sort: 3, isVisible: false }
      ]
    },
    {
      name: 'users',
      path: '/admin/users',
      icon: 'i-lucide-users',
      sort: 6,
      isVisible: true,
      children: [
        { name: 'View', path: '/admin/users/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
        { name: 'Create', path: '/admin/users/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
        { name: 'Edit', path: '/admin/users/[id]', icon: 'i-lucide-file-pen', sort: 3, isVisible: false },
        { name: 'Delete', path: '/admin/users/delete', icon: 'i-lucide-file-minus', sort: 4, isVisible: false }
      ]
    },
    {
      name: 'roles',
      path: '/admin/roles',
      icon: 'i-lucide-shield',
      sort: 7,
      isVisible: true,
      children: [
        { name: 'View', path: '/admin/roles/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
        { name: 'Create', path: '/admin/roles/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
        { name: 'Edit', path: '/admin/roles/[id]', icon: 'i-lucide-file-pen', sort: 3, isVisible: false },
        { name: 'Delete', path: '/admin/roles/delete', icon: 'i-lucide-file-minus', sort: 4, isVisible: false }
      ]
    },
    {
      name: 'products',
      path: '/admin/products',
      icon: 'i-lucide-package',
      sort: 8,
      isVisible: true,
      children: [
        { name: 'View', path: '/admin/products/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
        { name: 'Create', path: '/admin/products/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
        { name: 'Edit', path: '/admin/products/[id]', icon: 'i-lucide-file-pen', sort: 3, isVisible: false },
        { name: 'Delete', path: '/admin/products/delete', icon: 'i-lucide-file-minus', sort: 4, isVisible: false }
      ]
    },
    // {
    //   name: 'Tags',
    //   path: '/admin/taxonomies',
    //   icon: 'i-lucide-tag',
    //   sort: 9,
    //   children: [
    //     { name: 'Create', path: '/admin/taxonomies/create', isVisible: false },
    //     { name: 'Edit', path: '/admin/taxonomies/[id]', isVisible: false },
    //     { name: 'Delete', path: '/admin/taxonomies/delete', isVisible: false }
    //   ]
    // },
    {
      name: 'taxonomy',
      path: '/admin/taxonomies',
      icon: 'i-lucide-tag',
      sort: 9,
      isVisible: true,
      children: [
        { name: 'View', path: '/admin/taxonomies/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
        { name: 'Create', path: '/admin/taxonomies/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
        { name: 'Edit', path: '/admin/taxonomies/[id]', icon: 'i-lucide-file-pen', sort: 3, isVisible: false },
        { name: 'Delete', path: '/admin/taxonomies/delete', icon: 'i-lucide-file-minus', sort: 4, isVisible: false }
      ]
    },
    {
      name: 'attributes',
      path: '/admin/products/attributes',
      icon: 'i-lucide-list',
      sort: 10,
      isVisible: true,
      children: [
        { name: 'View', path: '/admin/products/attributes/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
        { name: 'Create', path: '/admin/products/attributes/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
        { name: 'Edit', path: '/admin/products/attributes/[id]', icon: 'i-lucide-file-pen', sort: 3, isVisible: false },
        { name: 'Delete', path: '/admin/products/attributes/delete', icon: 'i-lucide-file-minus', sort: 4, isVisible: false }
      ]
    },
    {
      name: 'system',
      path: '/admin/system',
      icon: 'i-lucide-settings',
      sort: 11,
      isVisible: true,
      children: [
        { name: 'View', path: '/admin/system/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
        { name: 'Create', path: '/admin/system/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
        { name: 'Edit', path: '/admin/system/[id]', icon: 'i-lucide-file-pen', sort: 3, isVisible: false },
        { name: 'Delete', path: '/admin/system/delete', icon: 'i-lucide-file-minus', sort: 4, isVisible: false }
      ]
    },
    {
      name: 'warehouses',
      path: '/admin/products/warehouse',
      icon: 'i-lucide-warehouse',
      sort: 12,
      isVisible: true,
      children: [
        { name: 'View', path: '/admin/products/warehouse/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
        { name: 'Create', path: '/admin/products/warehouse/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
        { name: 'Edit', path: '/admin/products/warehouse/[id]', icon: 'i-lucide-file-pen', sort: 3, isVisible: false },
        { name: 'Delete', path: '/admin/products/warehouse/delete', icon: 'i-lucide-file-minus', sort: 4, isVisible: false }
      ]
    },
    {
      name: 'inventory',
      path: '/admin/products/inventory',
      icon: 'i-lucide-container',
      sort: 13,
      isVisible: true,
      children: [
        { name: 'View', path: '/admin/products/inventory/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
        { name: 'Create', path: '/admin/products/inventory/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
        { name: 'Edit', path: '/admin/products/inventory/[id]', icon: 'i-lucide-file-pen', sort: 3, isVisible: false },
        { name: 'Delete', path: '/admin/products/inventory/delete', icon: 'i-lucide-file-minus', sort: 4, isVisible: false }
      ]
    },
    {
      name: 'payments',
      path: '/admin/products/payment',
      icon: 'i-lucide-banknote',
      sort: 14,
      isVisible: true,
      children: [
        { name: 'View', path: '/admin/products/payment/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
        { name: 'Create', path: '/admin/products/payment/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
        { name: 'Edit', path: '/admin/products/payment/[id]', icon: 'i-lucide-file-pen', sort: 3, isVisible: false },
        { name: 'Delete', path: '/admin/products/payment/delete', icon: 'i-lucide-file-minus', sort: 4, isVisible: false }
      ]
    },
    {
      name: 'settings',
      path: '/admin/settings',
      icon: 'i-lucide-sliders-horizontal',
      sort: 15,
      isVisible: true,
      children: [
        { name: 'View', path: '/admin/settings/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
        { name: 'Create', path: '/admin/settings/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
        { name: 'Edit', path: '/admin/settings/[id]', icon: 'i-lucide-file-pen', sort: 3, isVisible: false },
        { name: 'Delete', path: '/admin/settings/delete', icon: 'i-lucide-file-minus', sort: 4, isVisible: false }
      ]
    }
  ]

  console.log('Seeding routes...')

  async function seedRoute(route: any, parentId: any = null) {
    const routeData = { ...route }
    delete routeData.children

    routeData.parent = parentId || null

    const updatedRoute = await SystemRoute.findOneAndUpdate(
      { path: route.path },
      routeData,
      { upsert: true, new: true }
    )
    // console.log(`Seeded route: ${route.path}`)

    if (route.children && route.children.length > 0) {
      for (const child of route.children) {
        await seedRoute(child, updatedRoute._id)
      }
    }
  }

  for (const route of routes) {
    await seedRoute(route)
  }
}


async function seedRoles() {
  const roles = [
    {
      name: 'admin',
      description: 'Administrator with full access',
      permissions: ['*'],
      isDefault: false
    },
    {
      name: 'editor',
      description: 'Editor can manage content',
      permissions: [
        '/api/auth/*',
        '/api/posts*',
        '/api/categories*',
        '/api/taxonomies*',
        '/api/media*',
        '/api/products*',
        '/api/menus*'
      ],
      isDefault: false
    },
    {
      name: 'author',
      description: 'Author can manage their own content',
      permissions: [
        '/api/auth/*',
        '/api/posts*',
        '/api/media*'
      ],
      isDefault: false
    },
    {
      name: 'subscriber',
      description: 'Default user role',
      permissions: [
        '/api/auth/*',
        '/api/posts', // Public list
        '/api/categories',
        '/api/taxonomies',
        '/api/menus/position'
      ],
      isDefault: true
    }
  ]

  const createdRoles = []
  for (const role of roles) {
    // Ensure unique permissions
    role.permissions = [...new Set(role.permissions)]

    const updatedRole = await Role.findOneAndUpdate(
      { name: role.name },
      role,
      { upsert: true, new: true }
    )
    createdRoles.push(updatedRole)
  }
  return createdRoles
}

async function seedUsers(roles: any[]) {
  // Seed User Categories
  const userCategories = [
    { name: 'VIP', type: 'user', description: 'Very Important Person' },
    { name: 'Staff', type: 'user', description: 'Internal Staff' },
    { name: 'Member', type: 'user', description: 'Regular Member' }
  ]

  const createdCategories = []
  for (const cat of userCategories) {
    // Auto-generate slug
    const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const updatedCat = await Category.findOneAndUpdate(
      { slug: slug, type: 'user' },
      { ...cat, slug },
      { upsert: true, new: true }
    )
    createdCategories.push(updatedCat)
  }

  // Seed Admin User
  const adminRole = roles.find(r => r.name === 'admin')
  const staffCategory = createdCategories.find(c => c.name === 'Staff')

  if (adminRole) {
    const adminExists = await User.findOne({ username: 'admin' })
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        username: 'admin',
        email: 'admin@example.com',
        password: 'password123', // Will be hashed by pre-save hook
        roles: [adminRole._id], // Updated to array
        category: staffCategory?._id,
        isActive: true,
        bio: 'System Administrator'
      })
      console.log('Created admin user')
    }
  }
}
