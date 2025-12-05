import { Connect } from '../../models/Connect'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { id, flag } = body
    const user = event.context.user

    if (!id || flag === undefined) {
      throw createError({
        statusCode: 400,
        message: 'Missing required fields'
      })
    }

    const changeData = {
      at: Date.now(),
      by: user?._id,
      ip: event.node.req.socket.remoteAddress
    }

    const connect = await Connect.findByIdAndUpdate(
      id,
      {
        flag,
        updated: changeData
      },
      { new: true }
    )

    if (!connect) {
      throw createError({
        statusCode: 404,
        message: 'Connection not found'
      })
    }

    return {
      success: true,
      data: connect,
      message: 'Connection status updated successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
