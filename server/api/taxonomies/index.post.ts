import { z } from 'zod'
import { Taxonomy } from '../../models/Taxonomy'

const createTaxonomySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['tag', 'keyword']),
  description: z.string().optional(),
  color: z.string().optional()
})

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const body = await readBody(event)
    const data = createTaxonomySchema.parse(body)

    const taxonomy = await Taxonomy.create(data)

    return { success: true, data: taxonomy }
  } catch (error: any) {
    if (error.name === 'ZodError') throw createError({ statusCode: 400, message: error.errors, statusMessage: 'error.validation' })
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
