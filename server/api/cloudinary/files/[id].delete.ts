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
    const publicId = getRouterParam(event, 'id')

    if (!publicId) {
      throw createError({
        statusCode: 400,
        message: 'Missing public ID'
      })
    }

    const { cloudinary } = useCloudinary()

    // Decode the public_id (it might be URL encoded)
    const decodedPublicId = decodeURIComponent(publicId)

    await cloudinary.api.delete_resources([decodedPublicId])

    return {
      success: true,
      message: 'File deleted successfully'
    }

  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete file',
      message: error.message
    })
  }
})
