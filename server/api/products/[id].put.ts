import { Product } from '../../models/Product'
import { Attribute } from '../../models/Attribute'
import { syncTags, syncKeywords } from '../../utils/keywords'

export default defineEventHandler(async (event) => {
  // TODO: Add admin check
  const id = event.context.params?.id
  const body = await readBody(event)

  try {
    // Process tags and keywords
    if (body.tags && body.tags.length > 0) {
      body.tags = await syncTags(body.tags)
    }

    if (body.keywords && body.keywords.length > 0) {
      await syncKeywords(body.keywords)
    }

    // Process attributes
    if (body.attributes && body.attributes.length > 0) {
      for (const attr of body.attributes) {
        if (!attr.name || !attr.options || !Array.isArray(attr.options)) continue
        let attrDef = await Attribute.findOne({ name: attr.name, type: 'product' })
        if (!attrDef) {
          try {
            attrDef = await Attribute.create({ name: attr.name, type: 'product', values: attr.options })
          } catch (e) {
            attrDef = await Attribute.findOne({ name: attr.name, type: 'product' })
          }
        }
        if (attrDef) {
          let changed = false
          for (const val of attr.options) {
            if (!attrDef.values.includes(val)) {
              attrDef.values.push(val)
              changed = true
            }
          }
          if (changed) await attrDef.save()
        }
      }
    }

    const product = await Product.findByIdAndUpdate(id, body, { new: true })
    if (!product) throw createError({ statusCode: 404, message: 'Product not found', statusMessage: 'error.not_found' })
    return { success: true, data: product }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
