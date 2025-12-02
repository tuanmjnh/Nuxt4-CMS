import { User } from '../../models/User'
import { Role } from '../../models/Role'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  const body = await readBody(event)

  // Check admin permission
  const currentUser = event.context.user
  if (!currentUser || (currentUser.role.name !== 'admin' && currentUser.role !== 'admin'))
    throw createError({ statusCode: 403, message: 'Access denied', statusMessage: 'error.unauthorized' })

  try {
    // If role name is passed, find the role ID
    if (body.role && typeof body.role === 'string') {
      const roleDoc = await Role.findOne({ name: body.role })
      if (roleDoc) {
        body.role = roleDoc._id
      }
    }

    const user = await User.findByIdAndUpdate(id, body, { new: true, runValidators: true }).select('-password').populate('role')
    if (!user)
      throw createError({ statusCode: 404, message: 'User not found', statusMessage: 'error.user_not_found' })
    return user
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
