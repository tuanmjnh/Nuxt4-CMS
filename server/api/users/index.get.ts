import { User } from '../../models/User'

export default defineEventHandler(async (event) => {
  // Check admin permission
  const currentUser = event.context.user
  if (!currentUser || (currentUser.role.name !== 'admin' && currentUser.role !== 'admin'))
    throw createError({ statusCode: 403, message: 'Access denied', statusMessage: 'error.unauthorized' })

  try {
    const users = await User.find({ isDeleted: false }, '-password').populate('role')
    return users
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
