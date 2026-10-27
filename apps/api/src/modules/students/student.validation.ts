import { z } from 'zod';

export const createStudentSchema = z.object({
  admissionNo: z.string().min(1, 'Admission number is required'),
  rollNo: z.string().min(1, 'Roll number is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  class: z.string().min(1, 'Class is required'),
  section: z.string().optional().default('A'),
  grade: z.string().optional().default(''),
  gender: z.enum(['Male', 'Female', 'Other']).default('Male'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().default(''),
  address: z.string().optional().default(''),
  status: z.enum(['Active', 'Inactive', 'Archived']).default('Active'),
  guardian: z.object({
    name: z.string().min(1, 'Guardian name is required'),
    relationship: z.string().default('Parent'),
    phone: z.string().min(1, 'Guardian phone is required'),
    email: z.string().email('Invalid guardian email').optional().or(z.literal('')),
    occupation: z.string().optional().default(''),
  }),
});

export const updateStudentSchema = createStudentSchema.partial();

export const studentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  class: z.string().optional(),
  status: z.enum(['Active', 'Inactive', 'Archived', 'All']).optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type StudentQueryInput = z.infer<typeof studentQuerySchema>;
