import { Tag } from '../../models/Tag'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id

  // Check admin permission
  const currentUser = event.context.user
  if (!currentUser || (currentUser.role.name !== 'admin' && currentUser.role !== 'admin')) {
    throw createError({ statusCode: 403, message: 'Access denied', statusMessage: 'error.unauthorized' })
  }

  try {
    const tag = await Tag.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date()
    })

    if (!tag) throw createError({ statusCode: 404, message: 'Tag not found', statusMessage: 'error.not_found' })

    return { message: 'Tag deleted successfully' }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
