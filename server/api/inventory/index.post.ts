import mongoose from 'mongoose'
import { InventoryTransaction } from '../../models/InventoryTransaction'
import { Product } from '../../models/Product'
import { Warehouse } from '../../models/Warehouse'

export default defineEventHandler(async (event) => {
  // TODO: Add authorization check
  // const user = event.context.user
  const body = await readBody(event)
  const { type, warehouse, toWarehouse, items, note, reference } = body

  if (!items || items.length === 0) {
    throw createError({ statusCode: 400, message: 'No items provided', statusMessage: 'error.validation' })
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // 1. Validate Warehouse
    const warehouseDoc = await Warehouse.findById(warehouse).session(session)
    if (!warehouseDoc) throw new Error('Warehouse not found')

    if (type === 'transfer') {
      if (!toWarehouse) throw new Error('Destination warehouse required for transfer')
      const toWarehouseDoc = await Warehouse.findById(toWarehouse).session(session)
      if (!toWarehouseDoc) throw new Error('Destination warehouse not found')
    }

    // 2. Calculate total and prepare items
    let totalAmount = 0
    const processedItems = []

    for (const item of items) {
      const product = await Product.findById(item.product).session(session)
      if (!product) throw new Error(`Product ${item.product} not found`)

      // Update Stock Logic
      const quantity = Number(item.quantity)
      const price = Number(item.price) || 0
      totalAmount += quantity * price

      // Helper to update warehouse stock
      const updateWarehouseStock = (prod: any, whId: string, qty: number, isAdd: boolean) => {
        const stockEntry = prod.warehouseStock.find((s: any) => s.warehouse.toString() === whId.toString())
        if (stockEntry) {
          stockEntry.quantity += isAdd ? qty : -qty
        } else {
          if (!isAdd) throw new Error(`Not enough stock in warehouse for product ${prod.name}`)
          prod.warehouseStock.push({ warehouse: whId, quantity: qty })
        }
      }

      if (type === 'import') {
        product.stock += quantity
        updateWarehouseStock(product, warehouse, quantity, true)
      } else if (type === 'export') {
        if (product.stock < quantity) throw new Error(`Not enough global stock for product ${product.name}`)
        product.stock -= quantity
        updateWarehouseStock(product, warehouse, quantity, false)
      } else if (type === 'transfer') {
        // Decrease from source, Increase in dest
        // Global stock remains same
        updateWarehouseStock(product, warehouse, quantity, false)
        updateWarehouseStock(product, toWarehouse, quantity, true)
      }

      await product.save({ session })
      processedItems.push({
        product: item.product,
        variantSku: item.variantSku,
        quantity,
        price
      })
    }

    // 3. Create Transaction
    const transaction = await InventoryTransaction.create([{
      code: `TRX-${Date.now()}`, // Simple code generation
      type,
      warehouse,
      toWarehouse: type === 'transfer' ? toWarehouse : null,
      items: processedItems,
      totalAmount,
      status: 'completed', // Auto-complete for now
      note,
      reference,
      // createdBy: user._id
    }], { session })

    await session.commitTransaction()
    return { success: true, data: transaction[0] }

  } catch (error: any) {
    await session.abortTransaction()
    throw createError({ statusCode: 400, message: error.message, statusMessage: 'error.operation_failed' })
  } finally {
    session.endSession()
  }
})
