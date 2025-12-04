import { z } from 'zod'
import { User } from '../../models/User'
import { Role } from '../../models/Role'
import { hasPermission } from '../../utils/permissions'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores and dashes'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['admin', 'editor', 'author', 'subscriber']).optional()
})

export default defineEventHandler(async (event) => {
  try {
    // Connect to database
    await connectDB()

    // Check if user is authenticated and is admin
    const currentUser = event.context.user
    const isAdmin = currentUser && hasPermission('*', currentUser.permissions)
    // Actually, with new Role model, we should probably check if the role name is 'admin' or has permission.
    // For now, let's allow public registration with default role, and admin creation with specific role.

    // Parse and validate request body
    const body = await readBody(event)
    // Remove role from schema validation here, we handle it manually
    const { email, username, password, name, role: requestedRole } = registerSchema.parse(body)

    // Check if user already exists (email or username)
    const existingUser = await User.findOne({ $or: [{ email }, { username }] })

    if (existingUser) {
      throw createError({
        statusCode: 409,
        message: existingUser.email === email ? 'User with this email already exists' : 'Username already taken',
        statusMessage: existingUser.email === email ? 'error.exist_email' : 'error.exist_username'
      })
    }

    let roleId

    if (isAdmin && requestedRole) {
      // If admin, try to find the requested role
      // requestedRole here is likely a string name from the enum in schema, but we should probably accept ID or Name.
      // Since schema has enum, let's assume we want to map that enum to Role names for backward compatibility or just look up by name.
      const roleDoc = await Role.findOne({ name: requestedRole })
      if (roleDoc) {
        roleId = roleDoc._id
      }
    }

    if (!roleId) {
      // Find default role
      const defaultRole = await Role.findOne({ isDefault: true })
      if (defaultRole) {
        roleId = defaultRole._id
      } else {
        // Fallback: Find 'subscriber' role or create it?
        // Better to fail safe or create a temporary default role if seeding didn't run.
        // Let's try to find 'subscriber'
        const subscriberRole = await Role.findOne({ name: 'subscriber' })
        if (subscriberRole) {
          roleId = subscriberRole._id
        } else {
          // If absolutely no role found, maybe throw error or create one?
          // For safety, let's throw error saying system is not initialized
          throw createError({ statusCode: 500, message: 'System roles not initialized', statusMessage: 'error.server_error' })
        }
      }
    }

    // Create new user
    const newUser = await User.create({
      email,
      username,
      password,
      name,
      role: roleId
    })

    // Return user data (password excluded by model's toJSON)
    return {
      success: true,
      data: {
        user: {
          id: newUser._id,
          email: newUser.email,
          username: newUser.username,
          name: newUser.name,
          roles: newUser.roles
        }
      }
    }
  } catch (error: any) {
    if (error.name === 'ZodError')
      throw createError({ statusCode: 400, message: 'Validation error', statusMessage: 'error.validation', data: error.errors })
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: error.message, statusMessage: 'error.server_error' })
  }
})
