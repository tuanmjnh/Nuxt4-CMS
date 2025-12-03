import { Taxonomy } from '../models/Taxonomy'
import { toSlug } from './helper'

export const syncKeywords = async (keywords: string[]) => {
  if (!keywords || keywords.length === 0) return

  const operations = keywords.map(keyword => {
    const slug = toSlug(keyword)
    return {
      updateOne: {
        filter: { slug, type: 'keyword' },
        update: {
          $setOnInsert: {
            name: keyword,
            slug,
            type: 'keyword',
            count: 0,
            createdAt: Date.now(),
            updatedAt: Date.now()
          },
          $inc: { count: 1 },
          $set: { updatedAt: Date.now() }
        },
        upsert: true
      }
    }
  })

  await Taxonomy.bulkWrite(operations)
}

export const syncTags = async (tags: string[]): Promise<string[]> => {
  if (!tags || tags.length === 0) return []

  const tagIds: string[] = []

  for (const tagInput of tags) {
    // Check if it's a valid ObjectId
    if (tagInput.match(/^[0-9a-fA-F]{24}$/)) {
      const exists = await Taxonomy.findOne({ _id: tagInput, type: 'tag' })
      if (exists) {
        tagIds.push(exists._id.toString())
        continue
      }
    }

    // Treat as name
    const slug = toSlug(tagInput)
    let tag = await Taxonomy.findOne({ $or: [{ name: tagInput }, { slug: slug }], type: 'tag' })

    if (!tag) {
      try {
        tag = await Taxonomy.create({ name: tagInput, type: 'tag' })
      } catch (e) {
        tag = await Taxonomy.findOne({ name: tagInput, type: 'tag' })
      }
    }
    if (tag) tagIds.push(tag._id.toString())
  }

  return tagIds
}
