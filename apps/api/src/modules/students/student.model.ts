import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  schoolId: string;
  admissionNo: string;
  rollNo: string;
  firstName: string;
  lastName: string;
  name: string;
  class: string;
  section: string;
  grade: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  email?: string;
  phone?: string;
  address?: string;
  status: 'Active' | 'Inactive' | 'Archived';
  guardian: {
    id?: mongoose.Types.ObjectId | string;
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    occupation?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    schoolId: { type: String, required: true, default: 'school-default', index: true },
    admissionNo: { type: String, required: true, trim: true },
    rollNo: { type: String, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    class: { type: String, required: true, trim: true, index: true },
    section: { type: String, default: 'A' },
    grade: { type: String, default: '' },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    dateOfBirth: { type: String, required: true },
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    address: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Archived'],
      default: 'Active',
      index: true,
    },
    guardian: {
      id: { type: Schema.Types.ObjectId, ref: 'Guardian' },
      name: { type: String, required: true, trim: true },
      relationship: { type: String, default: 'Parent' },
      phone: { type: String, required: true, trim: true },
      email: { type: String, default: '' },
      occupation: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

// Compound unique indexes
StudentSchema.index({ schoolId: 1, admissionNo: 1 }, { unique: true });
StudentSchema.index({ schoolId: 1, class: 1, rollNo: 1 });
StudentSchema.index({ schoolId: 1, name: 'text', admissionNo: 'text' });

export const Student = mongoose.model<IStudent>('Student', StudentSchema);
