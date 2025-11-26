import mongoose from 'mongoose'
import { ProductAttribute } from '../server/models/ProductAttribute'
import { Product } from '../server/models/Product'

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nuxt4-cms'
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri)
    console.log('Connected to MongoDB')
  }
}

async function testProducts() {
  await connectDB()

  try {
    console.log('--- Testing Product Module ---')

    // 1. Create Attribute
    console.log('1. Creating Attribute...')
    const colorAttr = await ProductAttribute.create({
      name: 'Test Color',
      values: ['Red', 'Blue', 'Green']
    })
    console.log('   Attribute created:', colorAttr.name)

    // 2. Create Simple Product
    console.log('2. Creating Simple Product...')
    const simpleProduct = await Product.create({
      name: 'Test Simple Product',
      price: 100,
      stock: 10,
      type: 'simple',
      status: 'published'
    })
    console.log('   Simple Product created:', simpleProduct.name)

    // 3. Create Variable Product
    console.log('3. Creating Variable Product...')
    const variableProduct = await Product.create({
      name: 'Test Variable Product',
      type: 'variable',
      status: 'draft',
      attributes: [{
        name: 'Test Color',
        options: ['Red', 'Blue'],
        visible: true,
        variation: true
      }],
      variants: [
        {
          sku: 'VAR-RED',
          price: 110,
          stock: 5,
          attributes: [{ name: 'Test Color', value: 'Red' }]
        },
        {
          sku: 'VAR-BLUE',
          price: 120,
          stock: 3,
          attributes: [{ name: 'Test Color', value: 'Blue' }]
        }
      ]
    })
    console.log('   Variable Product created:', variableProduct.name)
    console.log('   Variants count:', variableProduct.variants.length)

    // Cleanup
    console.log('Cleaning up...')
    await ProductAttribute.findByIdAndDelete(colorAttr._id)
    await Product.findByIdAndDelete(simpleProduct._id)
    await Product.findByIdAndDelete(variableProduct._id)
    console.log('Cleanup done.')

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
  }
}

testProducts()
