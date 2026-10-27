import mongoose, { Document, Schema } from 'mongoose';

export interface IAcademicYear extends Document {
  schoolId: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AcademicYearSchema = new Schema<IAcademicYear>(
  {
    schoolId: { type: String, required: true, default: 'school-default', index: true },
    name: { type: String, required: true, trim: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    isCurrent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AcademicYearSchema.index({ schoolId: 1, name: 1 }, { unique: true });

export const AcademicYear = mongoose.model<IAcademicYear>('AcademicYear', AcademicYearSchema);

export interface IClass extends Document {
  schoolId: string;
  name: string;
  grade: string;
  section: string;
  roomNo?: string;
  capacity: number;
  classTeacher?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema = new Schema<IClass>(
  {
    schoolId: { type: String, required: true, default: 'school-default', index: true },
    name: { type: String, required: true, trim: true },
    grade: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true, default: 'A' },
    roomNo: { type: String, default: '' },
    capacity: { type: Number, default: 40 },
    classTeacher: { type: String, default: '' },
  },
  { timestamps: true }
);

ClassSchema.index({ schoolId: 1, grade: 1, section: 1 }, { unique: true });

export const ClassModel = mongoose.model<IClass>('Class', ClassSchema);
