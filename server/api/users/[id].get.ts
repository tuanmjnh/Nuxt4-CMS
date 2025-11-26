import { User } from '../../models/User'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id

  // Check admin permission
  const currentUser = event.context.user
  if (!currentUser || (currentUser.role.name !== 'admin' && currentUser.role !== 'admin')) {
    throw createError({ statusCode: 403, message: 'Access denied' })
  }

  try {
    await connectDB()
    const user = await User.findById(id).select('-password').populate('role').populate('category')

    if (!user) {
      throw createError({ statusCode: 404, message: 'User not found' })
    }

    return user
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message })
  }
})
