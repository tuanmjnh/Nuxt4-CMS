import mongoose, { Schema, Document } from 'mongoose'

export interface IPaymentTransaction extends Omit<Models.PaymentTransaction, '_id'>, Document { }

const PaymentTransactionSchema = new Schema<IPaymentTransaction>({
  amount: { type: Number, required: true },
  type: { type: String, enum: ['in', 'out'], required: true },
  reference: { type: String },
  method: { type: String, enum: ['cash', 'bank_transfer', 'card', 'other'], default: 'cash' },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  note: String,
  createdBy: { type: Schema.Types.ObjectId, ref: 'users' }
}, {
  timestamps: { currentTime: () => Date.now() }
})

export const PaymentTransaction =
  mongoose.models.payment_transaction || mongoose.model<IPaymentTransaction>('payment_transaction', PaymentTransactionSchema)
