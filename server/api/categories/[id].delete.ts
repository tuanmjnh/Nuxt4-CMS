import { Category } from '../../models/Category'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id

  // Check admin permission
  const currentUser = event.context.user
  if (!currentUser || (currentUser.role.name !== 'admin' && currentUser.role !== 'admin'))
    throw createError({ statusCode: 403, message: 'Access denied', statusMessage: 'error.unauthorized' })

  try {
    const category = await Category.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date()
    })

    if (!category)
      throw createError({ statusCode: 404, message: 'Category not found', statusMessage: 'error.not_found' })

    return { message: 'Category deleted successfully' }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: error.message, statusMessage: 'error.server_error' })
  }
})
