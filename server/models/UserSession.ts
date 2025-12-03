/// <reference path="../../types/index.d.ts" />
import mongoose, { Schema, Document, Types } from 'mongoose'
import { ChangeDataSchema } from './Schemas'


export interface IUserSessionDocument extends Omit<Models.UserSession, '_id'>, Document { }

const UserSessionSchema = new Schema<IUserSessionDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  refreshToken: {
    type: String,
    required: true,
    index: true
  },
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  deviceType: {
    type: String,
    enum: ['pc', 'mobile', 'tablet', 'web'],
    default: 'web'
  },
  userAgent: String,
  ip: String,
  lastActiveAt: {
    type: Number,
    default: Date.now
  },
  expiresAt: {
    type: Number,
    required: true,
    index: { expires: 0 } // Auto-delete when expired
  },
  history: { type: ChangeDataSchema, default: null },
  createdAt: { type: Number },
  updatedAt: { type: Number }
}, {
  timestamps: { currentTime: () => Date.now() }
})

export const UserSession: mongoose.Model<IUserSessionDocument> =
  mongoose.models.user_sessions || mongoose.model<IUserSessionDocument>('user_sessions', UserSessionSchema)
