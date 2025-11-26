import { AdminRoute } from '../models/AdminRoute'
import { Role } from '../models/Role'

export const seedRoutes = async () => {
  const routes = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: 'i-lucide-layout-dashboard',
      sortOrder: 1
    },
    {
      name: 'Posts',
      path: '/admin/posts',
      icon: 'i-lucide-file-text',
      sortOrder: 2
    },
    {
      name: 'Categories',
      path: '/admin/categories',
      icon: 'i-lucide-folder',
      sortOrder: 3
    },
    {
      name: 'Tags',
      path: '/admin/tags',
      icon: 'i-lucide-tag',
      sortOrder: 4
    },
    {
      name: 'Menus',
      path: '/admin/menus',
      icon: 'i-lucide-menu',
      sortOrder: 5
    },
    {
      name: 'Media',
      path: '/admin/media',
      icon: 'i-lucide-image',
      sortOrder: 6
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: 'i-lucide-users',
      sortOrder: 7
    },
    {
      name: 'Roles',
      path: '/admin/roles',
      icon: 'i-lucide-shield',
      sortOrder: 8
    },
    {
      name: 'Products',
      path: '/admin/products',
      icon: 'i-lucide-package',
      sortOrder: 9
    },
    {
      name: 'Attributes',
      path: '/admin/products/attributes',
      icon: 'i-lucide-list',
      sortOrder: 10
    }
  ]

  console.log('Seeding routes...')

  const createdRoutes = []
  for (const route of routes) {
    const existing = await AdminRoute.findOne({ path: route.path })
    if (!existing) {
      const newRoute = await AdminRoute.create(route)
      createdRoutes.push(newRoute)
      console.log(`Created route: ${route.name}`)
    } else {
      createdRoutes.push(existing)
    }
  }

  // Assign all routes to admin role
  const adminRole = await Role.findOne({ name: 'admin' })
  if (adminRole) {
    adminRole.allowedRoutes = createdRoutes.map(r => r._id)
    await adminRole.save()
    console.log('Updated admin role with all routes')
  }
}
