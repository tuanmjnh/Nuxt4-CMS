import mongoose from 'mongoose'

const systemConfigSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'json'],
    default: 'string'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  collection: 'system_configs'
})

export const SystemConfig = mongoose.models.SystemConfig || mongoose.model<Models.SystemConfig>('SystemConfig', systemConfigSchema)
