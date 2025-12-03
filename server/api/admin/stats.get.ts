import { Post } from '../../models/Post'
import { Product } from '../../models/Product'
import { User } from '../../models/User'

export default defineEventHandler(async (event) => {
  const now = Date.now()
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000

  const [
    postStats,
    productStats,
    totalUsers,
    postsLast30Days,
    productsLast30Days
  ] = await Promise.all([
    Post.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, total: { $sum: 1 }, views: { $sum: '$views' }, comments: { $sum: '$comments' } } }
    ]),
    Product.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, total: { $sum: 1 }, views: { $sum: '$views' }, sales: { $sum: '$sales' } } }
    ]),
    User.countDocuments({ isActive: true }),
    Post.find({
      isDeleted: false,
      createdAt: { $gte: thirtyDaysAgo }
    }).select('createdAt'),
    Product.find({
      isDeleted: false,
      createdAt: { $gte: thirtyDaysAgo }
    }).select('createdAt')
  ])

  // Process data for charts
  const getDaysArray = (start: number, end: number) => {
    const arr = []
    for (let dt = new Date(start); dt <= new Date(end); dt.setDate(dt.getDate() + 1)) {
      arr.push(new Date(dt).toISOString().split('T')[0])
    }
    return arr
  }

  const days = getDaysArray(thirtyDaysAgo, now)

  const chartData = days.map(day => {
    const postsCount = postsLast30Days.filter(p => new Date(p.createdAt!).toISOString().split('T')[0] === day).length
    const productsCount = productsLast30Days.filter(p => new Date(p.createdAt!).toISOString().split('T')[0] === day).length
    return {
      date: day,
      posts: postsCount,
      products: productsCount
    }
  })

  return {
    stats: {
      posts: postStats[0]?.total || 0,
      postViews: postStats[0]?.views || 0,
      postComments: postStats[0]?.comments || 0,
      products: productStats[0]?.total || 0,
      productViews: productStats[0]?.views || 0,
      productSales: productStats[0]?.sales || 0,
      users: totalUsers
    },
    chartData
  }
})
