import { Role } from '../models/Role'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    // Create Admin Role
    const adminRole = await Role.findOneAndUpdate(
      { name: 'admin' },
      {
        name: 'admin',
        description: 'Administrator with full access',
        permissions: ['*'],
        isDefault: false
      },
      { upsert: true, new: true }
    )

    // Create Subscriber Role
    const subscriberRole = await Role.findOneAndUpdate(
      { name: 'subscriber' },
      {
        name: 'subscriber',
        description: 'Default user role',
        permissions: [
          '/api/auth/*',
          '/api/posts', // Public list
          '/api/categories',
          '/api/tags',
          '/api/menus/position'
          // Add more specific user permissions here
        ],
        isDefault: true
      },
      { upsert: true, new: true }
    )

    // Create Editor Role
    const editorRole = await Role.findOneAndUpdate(
      { name: 'editor' },
      {
        name: 'editor',
        description: 'Editor can manage content',
        permissions: [
          '/api/auth/*',
          '/api/posts*',
          '/api/categories*',
          '/api/tags*',
          '/api/media*'
        ],
        isDefault: false
      },
      { upsert: true, new: true }
    )

    return {
      message: 'Roles seeded successfully',
      roles: [adminRole, subscriberRole, editorRole]
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message,
      statusMessage: 'error.server_error'
    })
  }
})
