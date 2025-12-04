import { InventoryTransaction } from '../../models/InventoryTransaction'

export default defineEventHandler(async (event) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Aggregate by type
    const stats = await InventoryTransaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth.getTime() }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ])

    // Daily stats for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const dailyStats = await InventoryTransaction.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo.getTime() }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$createdAt" } }
          },
          import: {
            $sum: {
              $cond: [{ $eq: ["$type", "import"] }, 1, 0]
            }
          },
          export: {
            $sum: {
              $cond: [{ $eq: ["$type", "export"] }, 1, 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ])

    return {
      success: true,
      stats,
      dailyStats
    }
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message, statusMessage: 'error.server_error' })
  }
})
