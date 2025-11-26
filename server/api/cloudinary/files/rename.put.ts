export default defineEventHandler(async (event) => {
  // Check authentication
  const currentUser = event.context.user
  if (!currentUser) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required'
    })
  }

  try {
    const body = await readBody(event)
    const { cloudinary } = useCloudinary()

    if (!body.from || !body.to) {
      throw createError({
        statusCode: 400,
        message: 'Both "from" and "to" parameters are required'
      })
    }

    await cloudinary.uploader.rename(body.from, body.to, {
      overwrite: true
    })

    return {
      success: true,
      message: 'File renamed successfully'
    }

  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to rename file',
      message: error.message
    })
  }
})
