import { SystemConfig } from '../../../models/SystemConfig'

export default defineEventHandler(async (event) => {
  // TODO: Add proper admin authorization check

  const body = await readBody(event)
  const { key, value, isPublic, type, description } = body

  if (!key) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Key is required'
    })
  }

  try {
    const config = await SystemConfig.findOneAndUpdate(
      { key },
      {
        value,
        isPublic: isPublic ?? false,
        type: type || 'string',
        description
      },
      { new: true, upsert: true }
    )

    // Update runtime config in memory immediately for the current process
    const runtimeConfig = useRuntimeConfig()
    if (config.isPublic) {
      // @ts-ignore
      if (!runtimeConfig.public) runtimeConfig.public = {}
      // @ts-ignore
      runtimeConfig.public[key] = config.value
    } else {
      // @ts-ignore
      runtimeConfig[key] = config.value
    }

    return {
      success: true,
      data: config
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: error
    })
  }
})
