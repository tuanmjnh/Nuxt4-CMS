import { Connect } from '../../../models/Connect'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const user = event.context.user

    const changeData = {
      at: Date.now(),
      by: user?._id,
      ip: event.node.req.socket.remoteAddress
    }

    // Body is expected to be { google: {...}, facebook: {...} }
    const promises = []

    for (const [key, data] of Object.entries(body)) {
      const connectData = data as any
      const updateData = {
        ...connectData,
        key,
        title: key.charAt(0).toUpperCase() + key.slice(1), // Simple title generation
        flag: connectData.enabled ? 1 : 0,
        updated: changeData
      }

      promises.push(
        Connect.findOneAndUpdate(
          { key },
          {
            $set: updateData,
            $setOnInsert: { created: changeData }
          },
          { upsert: true, new: true }
        )
      )
    }

    await Promise.all(promises)

    return {
      success: true,
      message: 'Connect settings updated successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
