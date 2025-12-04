import { PaymentTransaction } from '../../models/PaymentTransaction'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10
  const type = query.type

  const filter: any = {}
  if (type) filter.type = type

  try {
    const [payments, total] = await Promise.all([
      PaymentTransaction.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('createdBy', 'name'),
      PaymentTransaction.countDocuments(filter)
    ])

    return {
      success: true,
      data: payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message, statusMessage: 'error.server_error' })
  }
})
