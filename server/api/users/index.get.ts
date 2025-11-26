import { User } from '../../models/User'

export default defineEventHandler(async (event) => {
  // Check admin permission
  const currentUser = event.context.user
  if (!currentUser || (currentUser.role.name !== 'admin' && currentUser.role !== 'admin')) {
    // Check both object and string for safety during migration
    throw createError({
      statusCode: 403,
      message: 'Access denied'
    })
  }

  try {
    const users = await User.find({}, '-password').populate('role')
    return users
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
