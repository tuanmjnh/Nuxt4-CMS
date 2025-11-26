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

    // Prevent deleting self
    if (id === currentUser.userId) {
      throw createError({ statusCode: 400, message: 'Cannot delete your own account' })
    }

    const user = await User.findByIdAndDelete(id)

    if (!user) {
      throw createError({ statusCode: 404, message: 'User not found' })
    }

    return { success: true }
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message })
  }
})
