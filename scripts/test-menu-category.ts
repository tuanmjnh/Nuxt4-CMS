import mongoose from 'mongoose'
import { Category } from '../server/models/Category'
import { Product } from '../server/models/Product'
import { Menu } from '../server/models/Menu'
import { MenuItem } from '../server/models/MenuItem'

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nuxt4-cms'
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri)
    console.log('Connected to MongoDB')
  }
}

async function testMenuAndCategory() {
  await connectDB()

  try {
    console.log('--- Testing Menu and Category Updates ---')

    // 1. Create Product Category
    console.log('1. Creating Product Category...')
    const productCategory = await Category.create({
      name: 'Test Product Category',
      type: 'product'
    })
    console.log('   Product Category created:', productCategory.name, 'Type:', productCategory.type)

    // 2. Create Product
    console.log('2. Creating Product...')
    const product = await Product.create({
      name: 'Test Menu Product',
      price: 50,
      stock: 5,
      type: 'simple',
      status: 'published'
    })
    console.log('   Product created:', product.name)

    // 3. Create Menu
    console.log('3. Creating Menu...')
    const menu = await Menu.create({
      name: 'Test Menu',
      position: 'custom'
    })
    console.log('   Menu created:', menu.name)

    // 4. Create Menu Item linking to Product
    console.log('4. Creating Menu Item (Product Link)...')
    const menuItem = await MenuItem.create({
      menu: menu._id,
      label: 'Buy Product',
      linkType: 'product',
      product: product._id
    })
    console.log('   Menu Item created:', menuItem.label, 'LinkType:', menuItem.linkType, 'Product:', menuItem.product)

    // Cleanup
    console.log('Cleaning up...')
    await Category.findByIdAndDelete(productCategory._id)
    await Product.findByIdAndDelete(product._id)
    await Menu.findByIdAndDelete(menu._id)
    await MenuItem.findByIdAndDelete(menuItem._id)
    console.log('Cleanup done.')

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
  }
}

testMenuAndCategory()
