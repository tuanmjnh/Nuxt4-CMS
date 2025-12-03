import { User } from '../../models/User'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id

  // Check admin permission
  const currentUser = event.context.user
  if (!currentUser || !currentUser.roles.some((r: any) => (r.name === 'admin' || r === 'admin')))
    throw createError({ statusCode: 403, message: 'Access denied', statusMessage: 'error.unauthorized' })

  try {
    await connectDB()

    // Prevent deleting self
    if (id === currentUser.userId)
      throw createError({ statusCode: 400, message: 'Cannot delete your own account', statusMessage: 'error.cannot_delete_self' })

    const user = await User.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date()
    })

    if (!user)
      throw createError({ statusCode: 404, message: 'User not found', statusMessage: 'error.user_not_found' })

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
