import { Product } from '../../models/Product'

export default defineEventHandler(async (event) => {
  // TODO: Add admin check
  const id = event.context.params?.id
  const body = await readBody(event)

  try {
    // Process tags
    if (body.tags && body.tags.length > 0) {
      const { Tag } = await import('../../models/Tag')
      const tagIds = []
      for (const tagInput of body.tags) {
        if (tagInput.match(/^[0-9a-fA-F]{24}$/)) {
          const exists = await Tag.findById(tagInput)
          if (exists) {
            tagIds.push(exists._id)
            continue
          }
        }
        const slug = tagInput.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        let tag = await Tag.findOne({ $or: [{ name: tagInput }, { slug: slug }] })
        if (!tag) {
          try {
            tag = await Tag.create({ name: tagInput })
          } catch (e) {
            tag = await Tag.findOne({ name: tagInput })
          }
        }
        if (tag) tagIds.push(tag._id)
      }
      body.tags = tagIds
    }

    // Process attributes
    if (body.attributes && body.attributes.length > 0) {
      const { ProductAttribute } = await import('../../models/ProductAttribute')
      for (const attr of body.attributes) {
        if (!attr.name || !attr.options || !Array.isArray(attr.options)) continue
        let attrDef = await ProductAttribute.findOne({ name: attr.name })
        if (!attrDef) {
          try {
            attrDef = await ProductAttribute.create({ name: attr.name, values: attr.options })
          } catch (e) {
            attrDef = await ProductAttribute.findOne({ name: attr.name })
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
    return product
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
