import { InventoryTransaction } from '../../models/InventoryTransaction'

export default defineEventHandler(async (event) => {
  // TODO: Add authorization check
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10
  const type = query.type
  const warehouse = query.warehouse

  const filter: any = {}
  if (type) filter.type = type
  if (warehouse) filter.warehouse = warehouse

  try {
    const [transactions, total] = await Promise.all([
      InventoryTransaction.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('warehouse', 'name')
        .populate('toWarehouse', 'name')
        .populate('items.product', 'name sku')
        .populate('createdBy', 'name'),
      InventoryTransaction.countDocuments(filter)
    ])

    return {
      success: true,
      data: transactions,
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
