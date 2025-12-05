import { Connect } from '../../models/Connect'

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id
    const body = await readBody(event)
    const user = event.context.user

    const changeData = {
      at: Date.now(),
      by: user?._id,
      ip: event.node.req.socket.remoteAddress
    }

    const connect = await Connect.findByIdAndUpdate(
      id,
      {
        ...body,
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
      message: 'Connection updated successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
