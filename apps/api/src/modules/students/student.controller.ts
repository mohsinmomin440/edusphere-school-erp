import { Request, Response } from 'express';
import * as studentService from './student.service';
import {
  createStudentSchema,
  updateStudentSchema,
  studentQuerySchema,
} from './student.validation';
import { isDBConnected } from '../../config/database';

export const listStudents = async (req: Request, res: Response) => {
  const queryResult = studentQuerySchema.safeParse(req.query);
  if (!queryResult.success) {
    const errorMsg = queryResult.error.issues?.[0]?.message || 'Invalid query parameters';
    return res.status(400).json({ error: errorMsg });
  }

  const user = req.user!;
  const result = await studentService.getStudents(user, queryResult.data);
  return res.json(result);
};

export const getStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const student = await studentService.getStudentById(id, user);

  return res.json({ data: student });
};

export const createStudent = async (req: Request, res: Response) => {
  if (!isDBConnected()) {
    return res.status(503).json({
      error: 'Database unavailable: Persistent write operations require an active MongoDB connection. Local changes cannot be safely persisted.',
    });
  }

  const parseResult = createStudentSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues?.[0]?.message || 'Validation failed';
    return res.status(400).json({ error: errorMsg });
  }

  const user = req.user!;
  const newStudent = await studentService.createStudent(parseResult.data, user);
  return res.status(201).json({
    data: newStudent,
    message: 'Student registered successfully',
  });
};

export const updateStudent = async (req: Request, res: Response) => {
  if (!isDBConnected()) {
    return res.status(503).json({
      error: 'Database unavailable: Persistent write operations require an active MongoDB connection. Local changes cannot be safely persisted.',
    });
  }

  const { id } = req.params;
  const parseResult = updateStudentSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues?.[0]?.message || 'Validation failed';
    return res.status(400).json({ error: errorMsg });
  }

  const user = req.user!;
  const updated = await studentService.updateStudent(id, parseResult.data, user);
  return res.json({
    data: updated,
    message: 'Student updated successfully',
  });
};

export const deleteStudent = async (req: Request, res: Response) => {
  if (!isDBConnected()) {
    return res.status(503).json({
      error: 'Database unavailable: Persistent write operations require an active MongoDB connection. Local changes cannot be safely persisted.',
    });
  }

  const { id } = req.params;
  const user = req.user!;
  const archived = await studentService.archiveStudent(id, user);
  return res.json({
    data: archived,
    message: 'Student archived successfully',
  });
};
