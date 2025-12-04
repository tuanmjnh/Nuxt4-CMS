import { PaymentTransaction } from '../../models/PaymentTransaction'

export default defineEventHandler(async (event) => {
  // const user = event.context.user
  const body = await readBody(event)

  try {
    const payment = await PaymentTransaction.create({
      ...body,
      // createdBy: user._id
    })
    return { success: true, data: payment }
  } catch (error: any) {
    throw createError({ statusCode: 400, message: error.message, statusMessage: 'error.operation_failed' })
  }
})
