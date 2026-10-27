import mongoose, { Document, Schema } from 'mongoose';

export interface IGuardian extends Document {
  schoolId: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  occupation?: string;
  address?: string;
  status: 'Active' | 'Archived';
  createdAt: Date;
  updatedAt: Date;
}

const GuardianSchema = new Schema<IGuardian>(
  {
    schoolId: { type: String, required: true, default: 'school-default', index: true },
    name: { type: String, required: true, trim: true },
    relationship: { type: String, required: true, default: 'Guardian' },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    occupation: { type: String, default: '' },
    address: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Active', 'Archived'],
      default: 'Active',
      index: true,
    },
  },
  { timestamps: true }
);

GuardianSchema.index({ schoolId: 1, email: 1 });
GuardianSchema.index({ schoolId: 1, phone: 1 });
GuardianSchema.index({ schoolId: 1, status: 1 });

export const Guardian = mongoose.model<IGuardian>('Guardian', GuardianSchema);
