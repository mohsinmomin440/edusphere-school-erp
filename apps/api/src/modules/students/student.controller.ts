import { Request, Response } from 'express';
import * as studentService from './student.service';
import {
  createStudentSchema,
  updateStudentSchema,
  studentQuerySchema,
} from './student.validation';

export const listStudents = async (req: Request, res: Response) => {
  const queryResult = studentQuerySchema.safeParse(req.query);
  if (!queryResult.success) {
    const errorMsg = queryResult.error.issues?.[0]?.message || 'Invalid query parameters';
    return res.status(400).json({ error: errorMsg });
  }

  const schoolId = req.user?.schoolId || 'school-default';
  const result = await studentService.getStudents(schoolId, queryResult.data);
  return res.json(result);
};

export const getStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const schoolId = req.user?.schoolId || 'school-default';
  const student = await studentService.getStudentById(id, schoolId);

  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  return res.json({ data: student });
};

export const createStudent = async (req: Request, res: Response) => {
  const parseResult = createStudentSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues?.[0]?.message || 'Validation failed';
    return res.status(400).json({ error: errorMsg });
  }

  const schoolId = req.user?.schoolId || 'school-default';
  try {
    const newStudent = await studentService.createStudent(parseResult.data, schoolId);
    return res.status(201).json({
      data: newStudent,
      message: 'Student registered successfully',
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to create student' });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const parseResult = updateStudentSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues?.[0]?.message || 'Validation failed';
    return res.status(400).json({ error: errorMsg });
  }

  const schoolId = req.user?.schoolId || 'school-default';
  try {
    const updated = await studentService.updateStudent(id, parseResult.data, schoolId);
    return res.json({
      data: updated,
      message: 'Student updated successfully',
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to update student' });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const schoolId = req.user?.schoolId || 'school-default';

  try {
    const archived = await studentService.archiveStudent(id, schoolId);
    return res.json({
      data: archived,
      message: 'Student archived successfully',
    });
  } catch (error: any) {
    return res.status(404).json({ error: error.message || 'Student not found' });
  }
};
