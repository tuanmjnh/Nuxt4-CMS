import { SystemConfig } from '../../models/SystemConfig'
import { configService } from '../../utils/config.service'

export default defineEventHandler(async (event) => {
  // TODO: Add proper admin authorization check
  // const { user } = await requireAuth(event) // Example if you had authentication

  const body = await readBody(event)
  const { key, value, isPublic, type, description } = body

  if (!key)
    throw createError({ statusCode: 400, message: 'error.validation', statusMessage: 'error.validation' })

  try {
    // Save to DB and update Cache (RAM)
    // We reuse the existing logic but update it to use configService.set for optimal performance
    // Note: configService.set handles simpler updates (key, value). 
    // If we need to update other fields like isPublic, type, etc., we might need to modify configService.set 
    // or do a manual DB update + configService.set(key, value) just for cache.
    // For now, let's keep the detailed DB update, and then update cache manually.

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

    // Update RAM Cache via service (just the value, as cached by key)
    await configService.set(key, value)

    return { success: true, data: config }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: error.message, statusMessage: 'error.server_error' })
  }
})
