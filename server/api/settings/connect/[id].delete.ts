import { Connect } from '../../../models/Connect'

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id

    const connect = await Connect.findByIdAndDelete(id)

    if (!connect) {
      throw createError({
        statusCode: 404,
        message: 'Connection not found'
      })
    }

    return {
      success: true,
      message: 'Connection deleted successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
