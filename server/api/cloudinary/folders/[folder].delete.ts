export default defineEventHandler(async (event) => {
  // Check authentication
  const currentUser = event.context.user
  if (!currentUser)
    throw createError({ statusCode: 401, statusMessage: 'error.unauthorized', message: 'Authentication required' })

  try {
    const folderName = getRouterParam(event, 'folder')

    if (!folderName)
      throw createError({ statusCode: 400, statusMessage: 'error.validation', message: 'Missing folder name' })

    const { cloudinary } = useCloudinary()

    // Note: Folder must be empty to be deleted
    await cloudinary.api.delete_folder(folderName)

    return {
      success: true,
      message: 'Folder deleted successfully'
    }

  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
