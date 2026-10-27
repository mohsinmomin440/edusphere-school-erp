import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['Super Admin', 'School Admin', 'Principal', 'Accountant', 'Teacher', 'Admission Officer', 'Parent', 'Student']),
  name: z.string(),
});
