export default defineEventHandler(async (event) => {
  // Check authentication
  const currentUser = event.context.user
  if (!currentUser)
    throw createError({ statusCode: 401, statusMessage: 'error.unauthorized', message: 'Authentication required' })

  try {
    const body = await readBody(event)
    const { cloudinary } = useCloudinary()

    if (!body.name)
      throw createError({ statusCode: 400, statusMessage: 'error.validation', message: 'Folder name is required' })

    await cloudinary.api.create_folder(body.name)

    return {
      success: true,
      message: 'Folder created successfully'
    }

  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
