import mongoose, { Document, Schema } from 'mongoose';

export interface ISubject extends Document {
  schoolId: string;
  code: string;
  name: string;
  grade?: string;
  department?: string;
  type: 'Core' | 'Elective' | 'Extra-curricular';
  status: 'Active' | 'Archived';
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    schoolId: { type: String, required: true, default: 'school-default', index: true },
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    grade: { type: String, default: '' },
    department: { type: String, default: 'Academics' },
    type: {
      type: String,
      enum: ['Core', 'Elective', 'Extra-curricular'],
      default: 'Core',
    },
    status: {
      type: String,
      enum: ['Active', 'Archived'],
      default: 'Active',
      index: true,
    },
  },
  { timestamps: true }
);

SubjectSchema.index({ schoolId: 1, code: 1 }, { unique: true });
SubjectSchema.index({ schoolId: 1, grade: 1 });

export const Subject = mongoose.model<ISubject>('Subject', SubjectSchema);
