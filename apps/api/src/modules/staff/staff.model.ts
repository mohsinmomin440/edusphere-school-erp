import mongoose, { Document, Schema } from 'mongoose';

export interface IStaff extends Document {
  schoolId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  qualification?: string;
  joiningDate?: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema = new Schema<IStaff>(
  {
    schoolId: { type: String, required: true, default: 'school-default', index: true },
    employeeId: { type: String, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    department: { type: String, required: true, default: 'Academics' },
    designation: { type: String, required: true, default: 'Teacher' },
    qualification: { type: String, default: '' },
    joiningDate: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Inactive'],
      default: 'Active',
      index: true,
    },
  },
  { timestamps: true }
);

StaffSchema.index({ schoolId: 1, employeeId: 1 }, { unique: true });
StaffSchema.index({ schoolId: 1, email: 1 });

export const Staff = mongoose.model<IStaff>('Staff', StaffSchema);
