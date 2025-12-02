import { Role } from '../models/Role'
import { Category } from '../models/Category'
import { User } from '../models/User'

export default defineEventHandler(async (event) => {
  try {
    console.log('Starting seed process...')
    await connectDB()

    // 1. Seed Roles
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
          '/api/tags*',
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
          '/api/tags',
          '/api/menus/position'
        ],
        isDefault: true
      }
    ]

    const createdRoles = []
    for (const role of roles) {
      const updatedRole = await Role.findOneAndUpdate(
        { name: role.name },
        role,
        { upsert: true, new: true }
      )
      createdRoles.push(updatedRole)
    }

    // 2. Seed User Categories
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

    // 3. Seed Admin User
    const adminRole = createdRoles.find(r => r.name === 'admin')
    const staffCategory = createdCategories.find(c => c.name === 'Staff')

    if (adminRole) {
      const adminExists = await User.findOne({ username: 'admin' })
      if (!adminExists) {
        await User.create({
          name: 'Admin User',
          username: 'admin',
          email: 'admin@example.com',
          password: 'password123', // Will be hashed by pre-save hook
          role: adminRole._id,
          category: staffCategory?._id,
          isActive: true,
          bio: 'System Administrator'
        })
      }
    }

    return {
      message: 'Seeding completed successfully',
      roles: createdRoles,
      categories: createdCategories,
      adminCreated: !await User.findOne({ username: 'admin' })
    }

  } catch (error: any) {
    console.error('Seeding error:', error)
    throw createError({
      statusCode: 500,
      message: error.message,
      statusMessage: 'error.server_error'
    })
  }
})
