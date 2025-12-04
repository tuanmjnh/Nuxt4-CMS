import { Company } from '../../../models/Company'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const user = event.context.user

    // Add change history
    const changeData = {
      at: Date.now(),
      by: user?._id,
      ip: event.node.req.socket.remoteAddress
    }

    let company = await Company.findOne()

    if (company) {
      Object.assign(company, body)
      company.updated = changeData
      await company.save()
    } else {
      company = await Company.create({
        ...body,
        created: changeData
      })
    }

    return {
      success: true,
      data: company,
      message: 'Company info updated successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
