import { User } from '../../models/User'
import { Role } from '../../models/Role'
import { z } from 'zod'

const createUserSchema = z.object({
  name: z.string().min(1),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.string(), // Role ID or Name
  category: z.string().optional(),
  bio: z.string().optional(),
  isActive: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  // Check admin permission
  const currentUser = event.context.user
  if (!currentUser || (currentUser.role.name !== 'admin' && currentUser.role !== 'admin'))
    throw createError({ statusCode: 403, message: 'Access denied', statusMessage: 'error.unauthorized' })

  try {
    await connectDB()
    const body = await readBody(event)
    const data = createUserSchema.parse(body)

    // Resolve role if name is provided
    let roleId = data.role
    if (!roleId.match(/^[0-9a-fA-F]{24}$/)) {
      const roleDoc = await Role.findOne({ name: roleId })
      if (!roleDoc) {
        throw createError({ statusCode: 400, message: 'Invalid role', statusMessage: 'error.invalid_role' })
      }
      roleId = roleDoc._id.toString()
    }

    const existingUser = await User.findOne({
      $or: [{ email: data.email }, { username: data.username }]
    })

    if (existingUser)
      throw createError({ statusCode: 400, message: 'User already exists', statusMessage: 'error.exist' })

    const newUser = await User.create({
      ...data,
      role: roleId
    })

    return {
      success: true,
      data: newUser
    }
  } catch (error: any) {
    if (error.name === 'ZodError')
      throw createError({ statusCode: 400, message: 'Validation error', statusMessage: 'error.validation', data: error.errors })
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
