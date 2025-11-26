import { Role } from '../../models/Role'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id

  try {
    const role = await Role.findByIdAndDelete(id)
    if (!role) {
      throw createError({
        statusCode: 404,
        message: 'Role not found'
      })
    }
    return { message: 'Role deleted successfully' }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
