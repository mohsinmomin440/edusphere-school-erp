import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const validateLogin = (data: unknown) => {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    const message =
      result.error.issues?.[0]?.message ||
      (result.error as any).errors?.[0]?.message ||
      result.error.message ||
      'Validation error';
    return {
      error: { message },
      value: null,
    };
  }
  return { error: null, value: result.data };
};
