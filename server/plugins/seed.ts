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
      name: 'content',
      path: '/admin/content',
      icon: 'i-lucide-file-spreadsheet',
      sort: 2,
      isVisible: true,
      children: [
        {
          name: 'pages',
          path: '/admin/content/pages',
          icon: 'i-lucide-file',
          sort: 2,
          isVisible: true,
          children: [
            { name: 'view', path: '/admin/content/pages/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
            { name: 'create', path: '/admin/content/pages/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
            { name: 'edit', path: '/admin/content/pages/[id]', icon: 'i-lucide-file-pen', sort: 3, isVisible: false },
            { name: 'delete', path: '/admin/content/pages/delete', icon: 'i-lucide-file-minus', sort: 4, isVisible: false }
          ]
        },
        {
          name: 'posts',
          path: '/admin/content/posts',
          icon: 'i-lucide-newspaper',
          sort: 2,
          isVisible: true,
          children: [
            { name: 'view', path: '/admin/content/posts/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
            { name: 'create', path: '/admin/content/posts/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
            { name: 'edit', path: '/admin/content/posts/[id]', icon: 'i-lucide-file-pen', sort: 3, isVisible: false },
            { name: 'delete', path: '/admin/content/posts/delete', icon: 'i-lucide-file-minus', sort: 4, isVisible: false }
          ]
        }
      ]
    },
    {
      name: 'commerce',
      path: '/admin/commerce',
      icon: 'i-lucide-shopping-bag',
      sort: 3,
      isVisible: true,
      children: [
        {
          name: 'reports',
          path: '/admin/commerce/reports',
          icon: 'i-lucide-chart-no-axes-combined',
          sort: 1,
          isVisible: true
        },
        {
          name: 'products',
          path: '/admin/commerce/products',
          icon: 'i-lucide-package',
          sort: 2,
          isVisible: true,
          children: [
            { name: 'view', path: '/admin/commerce/products/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
            { name: 'create', path: '/admin/commerce/products/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
            { name: 'edit', path: '/admin/commerce/products/[id]', icon: 'i-lucide-file-pen', sort: 3, isVisible: false },
            { name: 'delete', path: '/admin/commerce/products/delete', icon: 'i-lucide-file-minus', sort: 4, isVisible: false }
          ]
        },
        {
          name: 'warehouses',
          path: '/admin/commerce/warehouses',
          icon: 'i-lucide-warehouse',
          sort: 3,
          isVisible: true,
          children: [
            { name: 'view', path: '/admin/commerce/warehouses/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
            { name: 'create', path: '/admin/commerce/warehouses/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
            { name: 'edit', path: '/admin/commerce/warehouses/[id]', icon: 'i-lucide-file-pen', sort: 3, isVisible: false },
            { name: 'delete', path: '/admin/commerce/warehouses/delete', icon: 'i-lucide-file-minus', sort: 4, isVisible: false }
          ]
        },
        {
          name: 'inventory',
          path: '/admin/commerce/inventory',
          icon: 'i-lucide-container',
          sort: 4,
          isVisible: true,
          children: [
            { name: 'view', path: '/admin/commerce/inventory/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
            { name: 'create', path: '/admin/commerce/inventory/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
            { name: 'edit', path: '/admin/commerce/inventory/[id]', icon: 'i-lucide-file-pen', sort: 3, isVisible: false },
            { name: 'delete', path: '/admin/commerce/inventory/delete', icon: 'i-lucide-file-minus', sort: 4, isVisible: false }
          ]
        },
        {
          name: 'payments',
          path: '/admin/commerce/payments',
          icon: 'i-lucide-banknote',
          sort: 5,
          isVisible: true,
          children: [
            { name: 'view', path: '/admin/commerce/payments/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
            { name: 'create', path: '/admin/commerce/payments/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
            { name: 'edit', path: '/admin/commerce/payments/[id]', icon: 'i-lucide-file-pen', sort: 3, isVisible: false },
            { name: 'delete', path: '/admin/commerce/payments/delete', icon: 'i-lucide-file-minus', sort: 4, isVisible: false }
          ]
        }
      ]
    },
    {
      name: 'settings',
      path: '/admin/settings',
      icon: 'i-lucide-settings',
      sort: 4,
      isVisible: true,
      children: [
        {
          name: 'categories',
          path: '/admin/settings/categories',
          icon: 'i-lucide-folder',
          sort: 1,
          isVisible: true,
          children: [
            { name: 'view', path: '/admin/settings/categories/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
            { name: 'create', path: '/admin/settings/categories/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
            { name: 'edit', path: '/admin/settings/categories/[id]', icon: 'i-lucide-file-pen', sort: 3, isVisible: false },
            { name: 'delete', path: '/admin/settings/categories/delete', icon: 'i-lucide-file-minus', sort: 4, isVisible: false }
          ]
        },
        {
          name: 'company',
          path: '/admin/settings/company',
          icon: 'i-lucide-building-2',
          sort: 2,
          isVisible: true,
          children: [
            { name: 'view', path: '/admin/settings/company/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
            { name: 'edit', path: '/admin/settings/company/edit', icon: 'i-lucide-file-pen', sort: 2, isVisible: false }
          ]
        },
        {
          name: 'menus',
          path: '/admin/settings/menus',
          icon: 'i-lucide-menu',
          sort: 3,
          isVisible: true,
          children: [
            { name: 'view', path: '/admin/settings/menus/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
            { name: 'create', path: '/admin/settings/menus/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
            { name: 'edit', path: '/admin/settings/menus/[id]', icon: 'i-lucide-file-pen', sort: 3, isVisible: false },
            { name: 'delete', path: '/admin/settings/menus/delete', icon: 'i-lucide-file-minus', sort: 4, isVisible: false }
          ]
        },
        {
          name: 'media',
          path: '/admin/settings/media',
          icon: 'i-lucide-image',
          sort: 4,
          isVisible: true,
          children: [
            { name: 'view', path: '/admin/settings/media/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
            { name: 'create', path: '/admin/settings/media/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
            { name: 'edit', path: '/admin/settings/media/[id]', icon: 'i-lucide-file-pen', sort: 3, isVisible: false },
            { name: 'delete', path: '/admin/settings/media/delete', icon: 'i-lucide-file-minus', sort: 4, isVisible: false }
          ]
        },
        {
          name: 'keywords',
          path: '/admin/settings/keywords',
          icon: 'i-lucide-tag',
          sort: 5,
          isVisible: true,
          children: [
            { name: 'view', path: '/admin/settings/keywords/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
            { name: 'create', path: '/admin/settings/keywords/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
            { name: 'edit', path: '/admin/settings/keywords/[id]', icon: 'i-lucide-file-pen', sort: 3, isVisible: false },
            { name: 'delete', path: '/admin/settings/keywords/delete', icon: 'i-lucide-file-minus', sort: 4, isVisible: false }
          ]
        },
        {
          name: 'attributes',
          path: '/admin/settings/attributes',
          icon: 'i-lucide-notepad-text',
          sort: 6,
          isVisible: true,
          children: [
            { name: 'view', path: '/admin/settings/attributes/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
            { name: 'create', path: '/admin/settings/attributes/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
            { name: 'edit', path: '/admin/settings/attributes/[id]', icon: 'i-lucide-file-pen', sort: 3, isVisible: false },
            { name: 'delete', path: '/admin/settings/attributes/delete', icon: 'i-lucide-file-minus', sort: 4, isVisible: false }
          ]
        },
      ]
    },
    {
      name: 'system',
      path: '/admin/system',
      icon: 'i-simple-icons-nuxt',
      sort: 5,
      isVisible: true,
      children: [
        {
          name: 'users',
          path: '/admin/system/users',
          icon: 'i-lucide-users',
          sort: 1,
          isVisible: true,
          children: [
            { name: 'view', path: '/admin/system/users/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
            { name: 'create', path: '/admin/system/users/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
            { name: 'edit', path: '/admin/system/users/[id]', icon: 'i-lucide-file-pen', sort: 3, isVisible: false },
            { name: 'delete', path: '/admin/system/users/delete', icon: 'i-lucide-file-minus', sort: 4, isVisible: false }
          ]
        },
        {
          name: 'roles',
          path: '/admin/roles',
          icon: 'i-lucide-shield',
          sort: 2,
          isVisible: true,
          children: [
            { name: 'view', path: '/admin/system/roles/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
            { name: 'create', path: '/admin/system/roles/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
            { name: 'edit', path: '/admin/system/roles/[id]', icon: 'i-lucide-file-pen', sort: 3, isVisible: false },
            { name: 'delete', path: '/admin/system/roles/delete', icon: 'i-lucide-file-minus', sort: 4, isVisible: false }
          ]
        },
        {
          name: 'config',
          path: '/admin/system/config',
          icon: 'i-simple-icons-vuetify',
          sort: 3,
          isVisible: true,
          children: [
            { name: 'view', path: '/admin/system/config/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
            { name: 'create', path: '/admin/system/config/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
            { name: 'edit', path: '/admin/system/config/[id]', icon: 'i-lucide-file-pen', sort: 3, isVisible: false },
            { name: 'delete', path: '/admin/system/config/delete', icon: 'i-lucide-file-minus', sort: 4, isVisible: false }
          ]
        },
        {
          name: 'connect',
          path: '/admin/system/connect',
          icon: 'i-lucide-link',
          sort: 4,
          isVisible: true,
          children: [
            { name: 'view', path: '/admin/system/connect/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
            { name: 'create', path: '/admin/system/connect/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
            { name: 'edit', path: '/admin/system/connect/[id]', icon: 'i-lucide-file-pen', sort: 3, isVisible: false },
            { name: 'delete', path: '/admin/system/connect/delete', icon: 'i-lucide-file-minus', sort: 4, isVisible: false }
          ]
        },
        {
          name: 'routes',
          path: '/admin/system/routes',
          icon: 'i-lucide-route',
          sort: 5,
          isVisible: true,
          children: [
            { name: 'view', path: '/admin/system/roles/view', icon: 'i-lucide-file-text', sort: 1, isVisible: false },
            { name: 'create', path: '/admin/system/roles/create', icon: 'i-lucide-file-plus', sort: 2, isVisible: false },
            { name: 'edit', path: '/admin/system/roles/[id]', icon: 'i-lucide-file-pen', sort: 3, isVisible: false },
            { name: 'delete', path: '/admin/system/roles/delete', icon: 'i-lucide-file-minus', sort: 4, isVisible: false }
          ]
        }
      ]
    },
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
      name: 'manager',
      description: 'Manager can manage content, commerce and settings',
      permissions: [
        '/api/auth/*',
        '/api/content/*',
        '/api/commerce/*',
        '/api/settings/*',
      ],
      isDefault: false
    },
    {
      name: 'editor',
      description: 'Editor can manage content and commerce',
      permissions: [
        '/api/auth/*',
        '/api/content/*',
        '/api/commerce/*'
      ],
      isDefault: false
    },
    {
      name: 'commercial',
      description: 'Commercial can manage commerce',
      permissions: [
        '/api/auth/*',
        '/api/commerce/*'
      ],
      isDefault: false
    },
    {
      name: 'author',
      description: 'Author can manage content',
      permissions: [
        '/api/auth/*',
        '/api/content/*',
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
    { name: 'Admin', slug: 'admin', type: 'user', description: 'Very Important Person' },
    { name: 'Manager', slug: 'manager', type: 'user', description: 'Internal manager' },
    { name: 'Staff', slug: 'staff', type: 'user', description: 'Regular staff' }
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
  const adminCategory = createdCategories.find(c => c.slug === 'admin')

  if (adminRole) {
    const adminExists = await User.findOne({ username: 'admin' })
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        username: 'admin',
        email: 'admin@example.com',
        password: 'password123', // Will be hashed by pre-save hook
        roles: [adminRole._id], // Updated to array
        category: adminCategory?._id,
        isActive: true,
        bio: 'System Administrator'
      })
      console.log('Created admin user')
    }
  }
}
