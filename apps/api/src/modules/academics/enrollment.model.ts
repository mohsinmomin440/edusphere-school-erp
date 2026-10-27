import mongoose, { Document, Schema } from 'mongoose';

export interface IEnrollment extends Document {
  schoolId: string;
  studentId: mongoose.Types.ObjectId | string;
  academicYearId: mongoose.Types.ObjectId | string;
  classId: mongoose.Types.ObjectId | string;
  className: string;
  rollNo: string;
  enrollmentDate: string;
  status: 'Enrolled' | 'Promoted' | 'Transferred' | 'Graduated' | 'Withdrawn';
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    schoolId: { type: String, required: true, default: 'school-default', index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    className: { type: String, required: true, trim: true },
    rollNo: { type: String, required: true, trim: true },
    enrollmentDate: { type: String, required: true },
    status: {
      type: String,
      enum: ['Enrolled', 'Promoted', 'Transferred', 'Graduated', 'Withdrawn'],
      default: 'Enrolled',
      index: true,
    },
  },
  { timestamps: true }
);

// Unique student enrollment per academic session
EnrollmentSchema.index({ schoolId: 1, studentId: 1, academicYearId: 1 }, { unique: true });
EnrollmentSchema.index({ schoolId: 1, classId: 1, academicYearId: 1 });

export const Enrollment = mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
