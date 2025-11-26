import { Role } from '../../models/Role'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    const role = await Role.create(body)
    return role
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
