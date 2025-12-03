import { z } from 'zod'
import { Taxonomy } from '../../models/Taxonomy'

const updateTaxonomySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  color: z.string().optional()
})

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const data = updateTaxonomySchema.parse(body)

    const taxonomy = await Taxonomy.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    )

    if (!taxonomy)
      throw createError({ statusCode: 404, message: 'Taxonomy not found', statusMessage: 'error.not_found' })

    return { success: true, data: taxonomy }
  } catch (error: any) {
    if (error.name === 'ZodError') throw createError({ statusCode: 400, message: error.errors, statusMessage: 'error.validation' })
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
