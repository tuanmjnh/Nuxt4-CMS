import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  // Check authentication
  const currentUser = event.context.user
  if (!currentUser)
    throw createError({ statusCode: 401, statusMessage: 'error.unauthorized', message: 'Authentication required' })

  try {
    const query = getQuery(event)
    const folder = query.folder as string | undefined

    const { preset, config } = useCloudinary()
    const apiSecret = useRuntimeConfig().cloudinaryApiSecret

    const timestamp = Math.round(Date.now() / 1000)

    // Signature generation
    const paramsToSign = `${folder ? `folder=${folder}&` : ''}timestamp=${timestamp}&upload_preset=${preset}`

    const signature = crypto
      .createHash('sha1')
      .update(paramsToSign + apiSecret)
      .digest('hex')

    return {
      signature,
      timestamp,
      cloudName: config.cloudName,
      apiKey: config.apiKey,
      preset,
      folder: folder || 'nuxt4-cms'
    }

  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
