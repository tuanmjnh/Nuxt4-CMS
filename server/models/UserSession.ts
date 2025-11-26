/// <reference path="../../types/index.d.ts" />
import mongoose, { Schema, Document, Types } from 'mongoose'


export interface IUserSessionDocument extends Omit<Models.UserSession, '_id' | 'createdAt' | 'updatedAt'>, Document { }

const UserSessionSchema = new Schema<IUserSessionDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  refreshToken: {
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
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // Auto-delete when expired
  }
}, {
  timestamps: true
})

export const UserSession: mongoose.Model<IUserSessionDocument> = mongoose.models.UserSession || mongoose.model<IUserSessionDocument>('UserSession', UserSessionSchema)
