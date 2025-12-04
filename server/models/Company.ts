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
  title: String,
  description: String,
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
  name: { type: String, required: true },
  shortName: String,
  slogan: String,
  desc: String,
  address: String,
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
  openingHours: String,
  bankAccounts: [BankAccountSchema],
  seo: SeoDataSchema,
  created: { type: ChangeDataSchema, default: null },
  updated: { type: ChangeDataSchema, default: null }
}, {
  timestamps: { currentTime: () => Date.now() }
})

export const Company = mongoose.models.companies || mongoose.model<ICompanyDocument>('companies', CompanySchema)
