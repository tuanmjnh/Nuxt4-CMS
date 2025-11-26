import { Role } from '../../models/Role'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  const body = await readBody(event)

  try {
    const role = await Role.findByIdAndUpdate(id, body, { new: true })
    if (!role) {
      throw createError({
        statusCode: 404,
        message: 'Role not found'
      })
    }
    return role
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
