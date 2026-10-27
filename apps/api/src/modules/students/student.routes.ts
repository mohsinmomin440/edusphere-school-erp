import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/asyncHandler';
import * as studentController from './student.controller';

const router = Router();

// Protect all student routes
router.use(authenticate);

// List students with pagination, search, filter
router.get('/', asyncHandler(studentController.listStudents));

// Get student profile by ID
router.get('/:id', asyncHandler(studentController.getStudent));

// Create student
router.post(
  '/',
  requireRole('Super Admin', 'Super Administrator', 'School Admin', 'Principal', 'Admission Officer'),
  asyncHandler(studentController.createStudent)
);

// Update student
router.patch(
  '/:id',
  requireRole('Super Admin', 'Super Administrator', 'School Admin', 'Principal', 'Admission Officer'),
  asyncHandler(studentController.updateStudent)
);

// Archive student (soft-delete)
router.delete(
  '/:id',
  requireRole('Super Admin', 'Super Administrator', 'School Admin', 'Principal'),
  asyncHandler(studentController.deleteStudent)
);

export default router;
