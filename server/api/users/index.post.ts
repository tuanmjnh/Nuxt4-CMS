import { User } from '../../models/User'
import { Role } from '../../models/Role'
import { z } from 'zod'

const createUserSchema = z.object({
  name: z.string().min(1),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  roles: z.array(z.string()).min(1), // Role IDs or Names
  category: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.any().optional(),
  personNumber: z.string().optional(),
  region: z.string().optional(),
  dateBirth: z.number().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  isActive: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  // Check admin permission
  const currentUser = event.context.user
  // Check if user has admin role (assuming roles is populated)
  const isAdmin = currentUser && currentUser.roles && currentUser.roles.some((r: any) => r.name === 'admin' || r === 'admin')
  if (!isAdmin)
    throw createError({ statusCode: 403, message: 'Access denied', statusMessage: 'error.unauthorized' })

  try {
    await connectDB()
    const body = await readBody(event)
    const data = createUserSchema.parse(body)

    // Resolve roles if names are provided
    const roleIds = []
    for (const roleInput of data.roles) {
      if (roleInput.match(/^[0-9a-fA-F]{24}$/)) {
        roleIds.push(roleInput)
      } else {
        const roleDoc = await Role.findOne({ name: roleInput })
        if (roleDoc) {
          roleIds.push(roleDoc._id.toString())
        } else {
          throw createError({ statusCode: 400, message: `Invalid role: ${roleInput}`, statusMessage: 'error.invalid_role' })
        }
      }
    }

    const existingUser = await User.findOne({
      $or: [{ email: data.email }, { username: data.username }]
    })

    if (existingUser)
      throw createError({ statusCode: 400, message: 'User already exists', statusMessage: 'error.exist' })

    const newUser = await User.create({
      ...data,
      roles: roleIds
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
