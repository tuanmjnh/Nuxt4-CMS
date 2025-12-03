import { AdminRoute } from '../models/AdminRoute'
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
      name: 'Dashboard',
      path: '/admin',
      icon: 'i-lucide-layout-dashboard',
      sort: 1
    },
    {
      name: 'Posts',
      path: '/admin/posts',
      icon: 'i-lucide-file-text',
      sort: 2,
      children: [
        { name: 'Create', path: '/admin/posts/create', isVisible: false },
        { name: 'Edit', path: '/admin/posts/[id]', isVisible: false },
        { name: 'Delete', path: '/admin/posts/delete', isVisible: false }
      ]
    },
    {
      name: 'Categories',
      path: '/admin/categories',
      icon: 'i-lucide-folder',
      sort: 3,
      children: [
        { name: 'Create', path: '/admin/categories/create', isVisible: false },
        { name: 'Edit', path: '/admin/categories/[id]', isVisible: false },
        { name: 'Delete', path: '/admin/categories/delete', isVisible: false }
      ]
    },
    {
      name: 'Menus',
      path: '/admin/menus',
      icon: 'i-lucide-menu',
      sort: 4,
      children: [
        { name: 'Create', path: '/admin/menus/create', isVisible: false },
        { name: 'Edit', path: '/admin/menus/[id]', isVisible: false },
        { name: 'Delete', path: '/admin/menus/delete', isVisible: false }
      ]
    },
    {
      name: 'Media',
      path: '/admin/media',
      icon: 'i-lucide-image',
      sort: 5,
      children: [
        { name: 'Create', path: '/admin/media/create', isVisible: false },
        { name: 'Delete', path: '/admin/media/delete', isVisible: false }
      ]
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: 'i-lucide-users',
      sort: 6,
      children: [
        { name: 'Create', path: '/admin/users/create', isVisible: false },
        { name: 'Edit', path: '/admin/users/[id]', isVisible: false },
        { name: 'Delete', path: '/admin/users/delete', isVisible: false }
      ]
    },
    {
      name: 'Roles',
      path: '/admin/roles',
      icon: 'i-lucide-shield',
      sort: 7,
      children: [
        { name: 'Create', path: '/admin/roles/create', isVisible: false },
        { name: 'Edit', path: '/admin/roles/[id]', isVisible: false },
        { name: 'Delete', path: '/admin/roles/delete', isVisible: false }
      ]
    },
    {
      name: 'Products',
      path: '/admin/products',
      icon: 'i-lucide-package',
      sort: 8,
      children: [
        { name: 'Create', path: '/admin/products/create', isVisible: false },
        { name: 'Edit', path: '/admin/products/[id]', isVisible: false },
        { name: 'Delete', path: '/admin/products/delete', isVisible: false }
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
      name: 'Taxonomy',
      path: '/admin/taxonomies',
      icon: 'i-lucide-tag',
      sort: 9,
      children: [
        { name: 'Create', path: '/admin/taxonomies/create', isVisible: false },
        { name: 'Edit', path: '/admin/taxonomies/[id]', isVisible: false },
        { name: 'Delete', path: '/admin/taxonomies/delete', isVisible: false }
      ]
    },
    {
      name: 'Attributes',
      path: '/admin/products/attributes',
      icon: 'i-lucide-list',
      sort: 10,
      children: [
        { name: 'Create', path: '/admin/products/attributes/create', isVisible: false },
        { name: 'Edit', path: '/admin/products/attributes/[id]', isVisible: false },
        { name: 'Delete', path: '/admin/products/attributes/delete', isVisible: false }
      ]
    }
  ]

  console.log('Seeding routes...')

  async function seedRoute(route: any, parentId: any = null) {
    const routeData = { ...route }
    delete routeData.children

    if (parentId) {
      routeData.parent = parentId
    }

    const updatedRoute = await AdminRoute.findOneAndUpdate(
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
