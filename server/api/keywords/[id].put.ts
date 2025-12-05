import { z } from 'zod'
import { Keywords } from '../../models/Keywords'

const updateKeywordsSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  color: z.string().optional()
})

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const data = updateKeywordsSchema.parse(body)

    const keywords = await Keywords.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    )

    if (!keywords)
      throw createError({ statusCode: 404, message: 'Keywords not found', statusMessage: 'error.not_found' })

    return { success: true, data: keywords }
  } catch (error: any) {
    if (error.name === 'ZodError') throw createError({ statusCode: 400, message: error.errors, statusMessage: 'error.validation' })
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
