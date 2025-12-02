export default defineEventHandler(async (event) => {
  // Check authentication
  const currentUser = event.context.user
  if (!currentUser)
    throw createError({ statusCode: 401, statusMessage: 'error.unauthorized', message: 'Authentication required' })

  try {
    const publicId = getRouterParam(event, 'id')

    if (!publicId)
      throw createError({ statusCode: 400, statusMessage: 'error.validation', message: 'Missing public ID' })

    const { cloudinary } = useCloudinary()

    // Decode the public_id (it might be URL encoded)
    const decodedPublicId = decodeURIComponent(publicId)

    await cloudinary.api.delete_resources([decodedPublicId])

    return {
      success: true,
      message: 'File deleted successfully',
      statusMessage: 'success'
    }

  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
