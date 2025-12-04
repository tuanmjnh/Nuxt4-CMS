import { SystemRoute } from '../../../models/SystemRoute'

export default defineEventHandler(async (event) => {
  await connectDB()
  const body = await readBody(event)

  // body should be an array of { _id, parent, sort }
  if (!Array.isArray(body))
    throw createError({ statusCode: 400, message: 'Invalid body, expected array', statusMessage: 'error.validation' })

  try {
    const operations = body.map((item) => {
      return {
        updateOne: {
          filter: { _id: item._id },
          update: {
            $set: {
              parent: item.parent || null,
              sort: item.sort
            }
          }
        }
      }
    })

    if (operations.length > 0) {
      await SystemRoute.bulkWrite(operations)
    }

    return { success: true, message: 'Routes updated successfully' }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: error.message, statusMessage: 'error.server_error' })
  }
})
