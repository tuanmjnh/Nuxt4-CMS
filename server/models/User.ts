/// <reference path="../../types/index.d.ts" />
import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcrypt'
import { ChangeDataSchema } from './Schemas'

export interface IUserDocument extends Omit<Models.User, '_id'>, Document {
  password: string
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3
  },
  roles: [{
    type: Schema.Types.ObjectId,
    ref: 'roles'
  }],
  category: {
    type: Schema.Types.ObjectId,
    ref: 'categories'
  },
  avatar: {
    type: Object,// Supports both string and Cloudinary.IFileAttach
    default: null
  },
  avatars: {
    type: [Object],
    default: []
  },
  bio: {
    type: String
  },
  personNumber: { type: String },
  phoneNumber: { type: String },
  region: { type: String },
  dateBirth: { type: Number },
  gender: { type: String },
  address: { type: String },
  salt: { type: String },
  lastLogin: { type: Number },
  lastChangePass: { type: Number },
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Number,
    default: null
  },
  history: { type: ChangeDataSchema, default: null },
  createdAt: { type: Number },
  updatedAt: { type: Number }
}, {
  timestamps: { currentTime: () => Date.now() }
})

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Remove password from JSON output
UserSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

export const User: mongoose.Model<IUserDocument> = mongoose.models.users || mongoose.model<IUserDocument>('users', UserSchema)
