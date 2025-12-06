import { connectDB } from './mongo.database'
import { SystemRoute } from '../models/SystemRoute'
import { Role } from '../models/Role'
import { User } from '../models/User'
import { Category } from '../models/Category'
import { Post } from '../models/Post'
import { Product } from '../models/Product'
import { configService } from './config.service'

export const seedDatabase = async () => {
  try {
    await connectDB()

    // Ensure config is loaded to prevent reseeding if plugin order is randomized
    // await configService.load()
    // console.log(configService.get('db_seeded'))

    // Check if already seeded
    if (configService.get('db_seeded') === true) {
      console.log('Database already seeded. Skipping...')
      return
    }

    // console.log('Starting seed process...')

    // Clear existing data
    // console.log('Clearing existing data...')
    await Promise.all([
      SystemRoute.deleteMany({}),
      Role.deleteMany({}),
      User.deleteMany({}),
      Category.deleteMany({}),
      Post.deleteMany({}),
      Product.deleteMany({})
    ])
    console.log('Data cleared')

    // 1. Seed Admin Routes
    await seedRoutes()

    // 2. Seed Roles
    const roles = await seedRoles()

    // 3. Seed Users & Categories
    const adminUser = await seedUsers(roles)

    // 4. Seed Posts
    if (adminUser) await seedPosts(adminUser)

    // 5. Seed Products
    await seedProducts()

    // Mark as seeded
    await configService.set('db_seeded', true)

    console.log('Seeding completed successfully')
  } catch (error) {
    console.error('Error seeding:', error)
  }
}

async function seedRoutes() {
  const routes = [
    {
      name: 'dashboard',
      path: '/admin',
      icon: 'i-lucide-layout-dashboard',
      sort: 1,
      // permission: null // Visible to all authenticated
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
          sort: 1,
          isVisible: true,
          permissions: ['/api/posts/*', '/api/users/authors'],
          children: [
            { name: 'create', path: '/admin/content/pages/create', icon: 'i-lucide-file-plus', sort: 1, isVisible: false },
            { name: 'edit', path: '/admin/content/pages/[id]/edit', icon: 'i-lucide-file-pen', sort: 2, isVisible: false },
            { name: 'delete', path: '/admin/content/pages/delete', icon: 'i-lucide-file-minus', sort: 3, isVisible: false }
          ]
        },
        {
          name: 'posts',
          path: '/admin/content/posts',
          icon: 'i-lucide-newspaper',
          sort: 2,
          isVisible: true,
          permissions: ['/api/posts/*', '/api/users/authors'],
          children: [
            { name: 'create', path: '/admin/content/posts/create', icon: 'i-lucide-file-plus', sort: 1, isVisible: false },
            { name: 'edit', path: '/admin/content/posts/[id]/edit', icon: 'i-lucide-file-pen', sort: 2, isVisible: false },
            { name: 'delete', path: '/admin/content/posts/delete', icon: 'i-lucide-file-minus', sort: 3, isVisible: false }
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
          isVisible: true,
          permissions: ['/api/reports/*']
        },
        {
          name: 'products',
          path: '/admin/commerce/products',
          icon: 'i-lucide-package',
          sort: 2,
          isVisible: true,
          permissions: ['/api/products/*'],
          children: [
            { name: 'create', path: '/admin/commerce/products/create', icon: 'i-lucide-file-plus', sort: 1, isVisible: false },
            { name: 'edit', path: '/admin/commerce/products/[id]', icon: 'i-lucide-file-pen', sort: 2, isVisible: false },
            { name: 'delete', path: '/admin/commerce/products/delete', icon: 'i-lucide-file-minus', sort: 3, isVisible: false }
          ]
        },
        {
          name: 'warehouses',
          path: '/admin/commerce/warehouses',
          icon: 'i-lucide-warehouse',
          sort: 3,
          isVisible: true,
          permissions: ['/api/warehouses/*'],
          children: [
            { name: 'create', path: '/admin/commerce/warehouses/create', icon: 'i-lucide-file-plus', sort: 1, isVisible: false },
            { name: 'edit', path: '/admin/commerce/warehouses/[id]', icon: 'i-lucide-file-pen', sort: 2, isVisible: false },
            { name: 'delete', path: '/admin/commerce/warehouses/delete', icon: 'i-lucide-file-minus', sort: 3, isVisible: false }
          ]
        },
        {
          name: 'inventory',
          path: '/admin/commerce/inventory',
          icon: 'i-lucide-container',
          sort: 4,
          isVisible: true,
          permissions: ['/api/inventory/*'],
          children: [
            { name: 'create', path: '/admin/commerce/inventory/create', icon: 'i-lucide-file-plus', sort: 1, isVisible: false },
            { name: 'edit', path: '/admin/commerce/inventory/[id]', icon: 'i-lucide-file-pen', sort: 2, isVisible: false },
            { name: 'delete', path: '/admin/commerce/inventory/delete', icon: 'i-lucide-file-minus', sort: 3, isVisible: false }
          ]
        },
        {
          name: 'payments',
          path: '/admin/commerce/payments',
          icon: 'i-lucide-banknote',
          sort: 5,
          isVisible: true,
          permissions: ['/api/payments/*'],
          children: [
            { name: 'create', path: '/admin/commerce/payments/create', icon: 'i-lucide-file-plus', sort: 1, isVisible: false },
            { name: 'edit', path: '/admin/commerce/payments/[id]', icon: 'i-lucide-file-pen', sort: 2, isVisible: false },
            { name: 'delete', path: '/admin/commerce/payments/delete', icon: 'i-lucide-file-minus', sort: 3, isVisible: false }
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
          name: 'company',
          path: '/admin/settings/company',
          icon: 'i-lucide-building-2',
          sort: 1,
          isVisible: true,
          permissions: ['/api/settings/company']
        },
        {
          name: 'categories',
          path: '/admin/settings/categories',
          icon: 'i-lucide-list',
          sort: 2,
          isVisible: true,
          permissions: ['/api/categories/*']
        },
        {
          name: 'menus',
          path: '/admin/settings/menus',
          icon: 'i-lucide-menu',
          sort: 3,
          isVisible: true,
          permissions: ['/api/menus/*']
        },
        {
          name: 'connect',
          path: '/admin/settings/connect',
          icon: 'i-lucide-link',
          sort: 4,
          isVisible: true,
          permissions: ['/api/settings/connect']
        },
        {
          name: 'media',
          path: '/admin/settings/media',
          icon: 'i-lucide-image',
          sort: 5,
          isVisible: true,
          permissions: ['/api/media/*']
        },
        {
          name: 'keywords',
          path: '/admin/settings/keywords',
          icon: 'i-lucide-tags',
          sort: 6,
          isVisible: true,
          permissions: ['/api/keywords/*']
        },
        {
          name: 'attributes',
          path: '/admin/settings/attributes',
          icon: 'i-lucide-sliders-horizontal',
          sort: 7,
          isVisible: true,
          permissions: ['/api/attributes/*']
        },
      ]
    },
    {
      name: 'system',
      path: '/admin/system',
      icon: 'i-lucide-shield-check',
      sort: 5,
      isVisible: true,
      children: [
        {
          name: 'users',
          path: '/admin/system/users',
          icon: 'i-lucide-users',
          sort: 1,
          isVisible: true,
          permissions: ['/api/users/*']
        },
        {
          name: 'roles',
          path: '/admin/system/roles',
          icon: 'i-lucide-shield',
          sort: 2,
          isVisible: true,
          permissions: ['/api/roles/*']
        },
        {
          name: 'routes',
          path: '/admin/system/routes',
          icon: 'i-lucide-route',
          sort: 3,
          isVisible: true,
          permissions: ['/api/routes/*']
        },
        {
          name: 'config',
          path: '/admin/system/config',
          icon: 'i-lucide-cog',
          sort: 4,
          isVisible: true,
          permissions: ['/api/config/*']
        }
      ]
    }
  ]


  async function seedRoute(route: any, parentId: any = null) {
    const routeData = { ...route }
    delete routeData.children

    routeData.parent = parentId || null

    // Ensure permissions is array or empty
    if (!routeData.permissions) routeData.permissions = []

    const updatedRoute = await SystemRoute.findOneAndUpdate(
      { path: route.path },
      routeData,
      { upsert: true, new: true }
    )

    if (route.children && route.children.length > 0) {
      for (const child of route.children) {
        await seedRoute(child, updatedRoute._id)
      }
    }
  }

  for (const route of routes)
    await seedRoute(route)

  console.log('seeded routes')
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
      description: 'Manager',
      permissions: [
        '/admin/content',
        '/admin/commerce',
        '/admin/settings',
        '/admin/system'
      ],
      isDefault: false
    },
    {
      name: 'editor',
      description: 'Editor',
      permissions: [
        '/admin/content',
        '/admin/commerce/products',
        '/admin/commerce/inventory',
        '/admin/settings/media',
        '/admin/settings/categories'
      ],
      isDefault: false
    },
    {
      name: 'commercial',
      description: 'Commercial',
      permissions: [
        '/admin/commerce',
        '/admin/settings/media'
      ],
      isDefault: false
    },
    {
      name: 'author',
      description: 'Author',
      permissions: [
        '/admin/content/pages',
        '/admin/content/posts',
        '/admin/settings/media'
      ],
      isDefault: true
    }
  ]

  const createdRoles = []
  for (const role of roles) {
    role.permissions = [...new Set(role.permissions)]
    const updatedRole = await Role.findOneAndUpdate(
      { name: role.name },
      role,
      { upsert: true, new: true }
    )
    createdRoles.push(updatedRole)
  }
  console.log('seeded roles')
  return createdRoles
}

async function seedUsers(roles: any[]) {
  const userCategories = [
    {
      title: { en: 'Admin', vi: 'Quản trị viên' },
      slug: { en: 'admin', vi: 'quan-tri-vien' },
      type: 'user',
      description: { en: 'Very Important Person', vi: 'Người rất quan trọng' }
    },
    {
      title: { en: 'Manager', vi: 'Quản lý' },
      slug: { en: 'manager', vi: 'quan-ly' },
      type: 'user',
      description: { en: 'Internal manager', vi: 'Quản lý nội bộ' }
    },
    {
      title: { en: 'Staff', vi: 'Nhân viên' },
      slug: { en: 'staff', vi: 'nhan-vien' },
      type: 'user',
      description: { en: 'Regular staff', vi: 'Nhân viên bình thường' }
    }
  ]

  const createdCategories = []
  for (const cat of userCategories) {
    const updatedCat = await Category.findOneAndUpdate(
      { 'slug.en': cat.slug.en, type: 'user' },
      cat,
      { upsert: true, new: true }
    )
    createdCategories.push(updatedCat)
  }

  const adminRole = roles.find(r => r.name === 'admin')
  const adminCategory = createdCategories.find(c => typeof c.slug !== 'string' && c.slug.en === 'admin')

  if (adminRole) {
    const adminExists = await User.findOne({ username: 'admin' })
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        username: 'admin',
        email: 'admin@example.com',
        password: 'password123',
        roles: [adminRole._id],
        category: adminCategory?._id,
        isActive: true,
        bio: 'System Administrator'
      })
      // console.log('Created admin user')
    }
  }

  const otherUsers = [
    { role: 'manager', userCat: 'manager', username: 'manager', name: 'Manager User', email: 'manager@example.com' },
    { role: 'editor', userCat: 'staff', username: 'editor', name: 'Editor User', email: 'editor@example.com' },
    { role: 'author', userCat: 'staff', username: 'author', name: 'Author User', email: 'author@example.com' },
    { role: 'commercial', userCat: 'staff', username: 'commercial', name: 'Commercial User', email: 'commercial@example.com' }
  ]

  for (const u of otherUsers) {
    const roleMap = roles.find(r => r.name === u.role)
    const cat = createdCategories.find(c => typeof c.slug !== 'string' && c.slug.en === u.userCat)

    if (roleMap) {
      const userExists = await User.findOne({ username: u.username })
      if (!userExists) {
        await User.create({
          name: u.name,
          username: u.username,
          email: u.email,
          password: 'password123',
          roles: [roleMap._id],
          category: cat?._id,
          isActive: true,
          bio: `${u.name} - ${u.role}`
        })
        // console.log(`Created ${u.role} user`)
      }
    }
  }
  console.log(`Seeded users`)
  return await User.findOne({ username: 'admin' })
}

async function seedPosts(author: any) {
  const count = await Post.countDocuments()
  if (count >= 15) return

  // console.log('Seeding posts...')
  const posts = []

  const types = ['post', 'page']
  const statuses = ['published', 'draft', 'scheduled']

  for (let i = 1; i <= 15; i++) {
    const title = `Sample Post ${i}`
    const type = i % 5 === 0 ? 'page' : 'post'
    const status = statuses[i % 3]

    posts.push({
      title: {
        en: `${title} (EN)`,
        vi: `${title} (VI)`
      },
      slug: {
        en: `sample-post-${i}-en`,
        vi: `sample-post-${i}-vi`
      },
      content: {
        en: `<p>This is the content for <strong>${title}</strong> in English. It contains some <em>sample text</em> to demonstrate the layout.</p>`,
        vi: `<p>Đây là nội dung cho <strong>${title}</strong> bằng tiếng Việt. Nó chứa một số <em>văn bản mẫu</em> để minh họa bố cục.</p>`
      },
      excerpt: {
        en: `This is a short excerpt for ${title}.`,
        vi: `Đây là đoạn trích ngắn cho ${title}.`
      },
      type,
      status,
      author: author._id,
      publishedAt: status === 'published' ? Date.now() : null,
      views: Math.floor(Math.random() * 1000),
      likes: Math.floor(Math.random() * 100)
    })
  }

  for (const post of posts) {
    await Post.findOneAndUpdate(
      { 'slug.en': post.slug.en },
      post,
      { upsert: true, new: true }
    )
  }
  console.log('seeded posts')
}

async function seedProducts() {
  const count = await Product.countDocuments()
  if (count >= 15) return

  // console.log('Seeding products...')
  const products = []

  const types = ['simple', 'variable']
  const statuses = ['published', 'draft']

  for (let i = 1; i <= 15; i++) {
    const name = `Sample Product ${i}`
    const type = i % 4 === 0 ? 'variable' : 'simple'
    const status = statuses[i % 2]
    const price = (i * 10) + 99

    products.push({
      name: {
        en: `${name} (EN)`,
        vi: `${name} (VI)`
      },
      slug: {
        en: `sample-product-${i}-en`,
        vi: `sample-product-${i}-vi`
      },
      type,
      status,
      price,
      salePrice: i % 3 === 0 ? price * 0.8 : undefined,
      sku: `SP-${1000 + i}`,
      stock: Math.floor(Math.random() * 100),
      desc: {
        en: `<p>Detailed description for <strong>${name}</strong>.</p>`,
        vi: `<p>Mô tả chi tiết cho <strong>${name}</strong>.</p>`
      },
      shortDesc: {
        en: `Short description for ${name}.`,
        vi: `Mô tả ngắn cho ${name}.`
      },
      manageStock: true,
      views: Math.floor(Math.random() * 500),
      sales: Math.floor(Math.random() * 50)
    })
  }

  for (const product of products) {
    await Product.findOneAndUpdate(
      { 'slug.en': product.slug.en },
      product,
      { upsert: true, new: true }
    )
  }
  console.log('seeded products')
}
