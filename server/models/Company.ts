import mongoose, { Schema, Document } from 'mongoose'
import { ChangeDataSchema } from './Schemas'

export interface ICompanyDocument extends Omit<Models.Company, '_id'>, Document { }

const SocialDataSchema = new Schema({
  facebook: String,
  twitter: String,
  instagram: String,
  linkedin: String,
  youtube: String,
  tiktok: String,
  zalo: String
}, { _id: false })

const SeoDataSchema = new Schema({
  title: { en: String, vi: String },
  description: { en: String, vi: String },
  keywords: [String],
  image: Object
}, { _id: false })

const BankAccountSchema = new Schema({
  bankName: { type: String, required: true },
  number: { type: String, required: true },
  owner: { type: String, required: true },
  qrCode: { type: Object, default: null }
}, { _id: false })

const CompanySchema = new Schema<ICompanyDocument>({
  name: {
    en: { type: String, required: true },
    vi: { type: String, required: true }
  },
  shortName: { en: String, vi: String },
  slogan: { en: String, vi: String },
  desc: { en: String, vi: String },
  address: { en: String, vi: String },
  phone: String,
  fax: String,
  email: String,
  website: String,
  hotline: String,
  taxCode: String,
  logo: { type: Object, default: null },
  banner: { type: Object, default: null },
  gallery: { type: [Object], default: null },
  mapEmbed: String,
  social: SocialDataSchema,
  openingHours: { en: String, vi: String },
  bankAccounts: [BankAccountSchema],
  seo: SeoDataSchema,
  created: { type: ChangeDataSchema, default: null },
  updated: { type: ChangeDataSchema, default: null }
}, {
  timestamps: { currentTime: () => Date.now() }
})

export const Company = mongoose.models.companies || mongoose.model<ICompanyDocument>('companies', CompanySchema)
