import { z } from 'zod'
import { Keywords } from '../../models/Keywords'

const createKeywordsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['tag', 'keyword']),
  description: z.string().optional(),
  color: z.string().optional()
})

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const body = await readBody(event)
    const data = createKeywordsSchema.parse(body)

    const keywords = await Keywords.create(data)

    return { success: true, data: keywords }
  } catch (error: any) {
    if (error.name === 'ZodError') throw createError({ statusCode: 400, message: error.errors, statusMessage: 'error.validation' })
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
