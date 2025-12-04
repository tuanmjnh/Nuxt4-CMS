import mongoose, { Schema, Document } from 'mongoose'
import { ChangeDataSchema } from './Schemas'

export interface IConnectDocument extends Omit<Models.Connect, '_id'>, Document { }

const ConnectSchema = new Schema<IConnectDocument>({
  key: { type: String, required: true, unique: true, index: true },
  code: { type: String },
  title: { type: String, required: true },
  clientID: { type: String, default: null },
  credentials: { type: Object, default: null },
  authUri: { type: String },
  redirectUris: [{ type: String }],
  profile: { type: Object, default: null },
  config: { type: Object, default: null },
  sort: { type: Number, default: 0 },
  flag: { type: Number, default: 1 },
  created: { type: ChangeDataSchema, default: null },
  updated: { type: ChangeDataSchema, default: null }
}, {
  timestamps: { currentTime: () => Date.now() }
})

export const Connect = mongoose.models.connects || mongoose.model<IConnectDocument>('connects', ConnectSchema)
