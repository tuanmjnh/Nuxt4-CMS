import mongoose, { Document } from 'mongoose'
import { ChangeDataSchema } from './Schemas'

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
  },
  history: { type: ChangeDataSchema, default: null },
  createdAt: { type: Number },
  updatedAt: { type: Number }
}, {
  timestamps: { currentTime: () => Date.now() }
})

export interface ISystemConfigDocument extends Omit<Models.SystemConfig, '_id'>, Document { }

export const SystemConfig = mongoose.models.system_configs || mongoose.model<ISystemConfigDocument>('system_configs', systemConfigSchema)
