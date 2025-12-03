import { Schema, Document } from 'mongoose'

export const ChangeDataSchema = new Schema({
  at: { type: Number, default: Date.now },
  by: { type: String, default: 'system' },
  ip: { type: String, default: null }
}, { _id: false })
