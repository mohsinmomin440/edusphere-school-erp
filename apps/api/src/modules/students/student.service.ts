import { Student } from './student.model';
import { Guardian } from '../guardians/guardian.model';
import {
  CreateStudentInput,
  UpdateStudentInput,
  StudentQueryInput,
} from './student.validation';
import { isDBConnected } from '../../config/database';

// Initial synthetic seed data matching the EduSphere design reference
const DEMO_STUDENTS: any[] = [
  {
    _id: 'demo-student-1',
    schoolId: 'school-default',
    admissionNo: 'ADM-2025-0101',
    rollNo: '101',
    firstName: 'Aarav',
    lastName: 'Sharma',
    name: 'Aarav Sharma',
    class: '5A',
    section: 'A',
    grade: 'Grade 5',
    gender: 'Male',
    dateOfBirth: '2014-01-12',
    email: 'aarav@example.com',
    phone: '+91 98765 43210',
    address: '124 Green Avenue, New Delhi',
    status: 'Active',
    guardian: {
      name: 'Rahul Sharma',
      relationship: 'Father',
      phone: '+91 98765 43210',
      email: 'rahul.sharma@example.com',
      occupation: 'Software Architect',
    },
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-10'),
  },
  {
    _id: 'demo-student-2',
    schoolId: 'school-default',
    admissionNo: 'ADM-2025-0202',
    rollNo: '202',
    firstName: 'Riya',
    lastName: 'Patel',
    name: 'Riya Patel',
    class: '8B',
    section: 'B',
    grade: 'Grade 8',
    gender: 'Female',
    dateOfBirth: '2011-05-23',
    email: 'riya@example.com',
    phone: '+91 98765 43211',
    address: '45 Sunset Boulevard, Ahmedabad',
    status: 'Active',
    guardian: {
      name: 'Neha Patel',
      relationship: 'Mother',
      phone: '+91 98765 43211',
      email: 'neha.patel@example.com',
      occupation: 'Doctor',
    },
    createdAt: new Date('2025-01-11'),
    updatedAt: new Date('2025-01-11'),
  },
  {
    _id: 'demo-student-3',
    schoolId: 'school-default',
    admissionNo: 'ADM-2025-0301',
    rollNo: '301',
    firstName: 'Arjun',
    lastName: 'Mehta',
    name: 'Arjun Mehta',
    class: '10A',
    section: 'A',
    grade: 'Grade 10',
    gender: 'Male',
    dateOfBirth: '2009-08-14',
    email: 'arjun@example.com',
    phone: '+91 98765 43212',
    address: '88 Lakeview Road, Mumbai',
    status: 'Active',
    guardian: {
      name: 'Pooja Mehta',
      relationship: 'Mother',
      phone: '+91 98765 43212',
      email: 'pooja.mehta@example.com',
      occupation: 'Professor',
    },
    createdAt: new Date('2025-01-12'),
    updatedAt: new Date('2025-01-12'),
  },
  {
    _id: 'demo-student-4',
    schoolId: 'school-default',
    admissionNo: 'ADM-2025-0402',
    rollNo: '402',
    firstName: 'Sneha',
    lastName: 'Kapoor',
    name: 'Sneha Kapoor',
    class: '7C',
    section: 'C',
    grade: 'Grade 7',
    gender: 'Female',
    dateOfBirth: '2012-11-04',
    email: 'sneha@example.com',
    phone: '+91 98765 43213',
    address: '12 Park Street, Kolkata',
    status: 'Active',
    guardian: {
      name: 'Anil Kapoor',
      relationship: 'Father',
      phone: '+91 98765 43213',
      email: 'anil.kapoor@example.com',
      occupation: 'Business Executive',
    },
    createdAt: new Date('2025-01-13'),
    updatedAt: new Date('2025-01-13'),
  },
  {
    _id: 'demo-student-5',
    schoolId: 'school-default',
    admissionNo: 'ADM-2025-0503',
    rollNo: '503',
    firstName: 'Karan',
    lastName: 'Singh',
    name: 'Karan Singh',
    class: '9B',
    section: 'B',
    grade: 'Grade 9',
    gender: 'Male',
    dateOfBirth: '2010-03-30',
    email: 'karan@example.com',
    phone: '+91 98765 43214',
    address: '9 Civil Lines, Jaipur',
    status: 'Active',
    guardian: {
      name: 'Priya Singh',
      relationship: 'Mother',
      phone: '+91 98765 43214',
      email: 'priya.singh@example.com',
      occupation: 'Lawyer',
    },
    createdAt: new Date('2025-01-14'),
    updatedAt: new Date('2025-01-14'),
  },
];

let localDemoStore = [...DEMO_STUDENTS];

export const getStudents = async (
  schoolId: string,
  query: StudentQueryInput
) => {
  const { page, limit, search, class: classFilter, status, sortBy, sortOrder } = query;

  if (isDBConnected()) {
    const filter: Record<string, any> = { schoolId };

    if (status && status !== 'All') {
      filter.status = status;
    } else if (!status) {
      filter.status = { $ne: 'Archived' };
    }

    if (classFilter && classFilter !== 'All') {
      filter.class = classFilter;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { admissionNo: searchRegex },
        { rollNo: searchRegex },
        { 'guardian.name': searchRegex },
      ];
    }

    const sortOptions: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      Student.find(filter).sort(sortOptions).skip(skip).limit(limit).lean(),
      Student.countDocuments(filter),
    ]);

    return {
      data: students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      source: 'database',
    };
  }

  // Fallback in-memory preview when Atlas is disconnected
  let filtered = localDemoStore.filter(
    (s) => (s.schoolId || 'school-default') === schoolId
  );

  if (status && status !== 'All') {
    filtered = filtered.filter((s) => s.status === status);
  } else if (!status) {
    filtered = filtered.filter((s) => s.status !== 'Archived');
  }

  if (classFilter && classFilter !== 'All') {
    filtered = filtered.filter((s) => s.class === classFilter);
  }

  if (search && search.trim()) {
    const sLower = search.trim().toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.name?.toLowerCase().includes(sLower) ||
        s.admissionNo?.toLowerCase().includes(sLower) ||
        s.rollNo?.toLowerCase().includes(sLower) ||
        s.guardian?.name?.toLowerCase().includes(sLower)
    );
  }

  const total = filtered.length;
  const skip = (page - 1) * limit;
  const paginated = filtered.slice(skip, skip + limit);

  return {
    data: paginated,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
    source: 'fallback-demo',
  };
};

export const getStudentById = async (id: string, schoolId: string) => {
  if (isDBConnected()) {
    return Student.findOne({ _id: id, schoolId }).lean();
  }
  return localDemoStore.find((s) => s._id === id && (s.schoolId || 'school-default') === schoolId) || null;
};

export const createStudent = async (
  input: CreateStudentInput,
  schoolId: string
) => {
  const fullName = `${input.firstName} ${input.lastName}`.trim();

  if (isDBConnected()) {
    // Check duplicate admission number
    const existing = await Student.findOne({ schoolId, admissionNo: input.admissionNo });
    if (existing) {
      throw new Error(`A student with admission number "${input.admissionNo}" already exists in this school.`);
    }

    // Check duplicate roll number in same class
    const duplicateRoll = await Student.findOne({
      schoolId,
      class: input.class,
      rollNo: input.rollNo,
      status: { $ne: 'Archived' },
    });
    if (duplicateRoll) {
      throw new Error(`Roll number ${input.rollNo} is already assigned to another student in class ${input.class}.`);
    }

    // Upsert or create guardian record
    let guardianDoc = await Guardian.findOne({
      schoolId,
      phone: input.guardian.phone,
    });
    if (!guardianDoc) {
      guardianDoc = await Guardian.create({
        schoolId,
        name: input.guardian.name,
        relationship: input.guardian.relationship,
        phone: input.guardian.phone,
        email: input.guardian.email || '',
        occupation: input.guardian.occupation || '',
      });
    }

    const newStudent = await Student.create({
      ...input,
      name: fullName,
      schoolId,
      guardian: {
        ...input.guardian,
        id: guardianDoc._id,
      },
    });

    return newStudent;
  }

  // Fallback demo creation for development testing without live Atlas
  const newDemoStudent = {
    _id: `demo-student-${Date.now()}`,
    schoolId,
    admissionNo: input.admissionNo,
    rollNo: input.rollNo,
    firstName: input.firstName,
    lastName: input.lastName,
    name: fullName,
    class: input.class,
    section: input.section || 'A',
    grade: input.grade || `Grade ${input.class.replace(/\D/g, '')}`,
    gender: input.gender,
    dateOfBirth: input.dateOfBirth,
    email: input.email || '',
    phone: input.phone || '',
    address: input.address || '',
    status: input.status,
    guardian: {
      ...input.guardian,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  localDemoStore.unshift(newDemoStudent as any);
  return newDemoStudent;
};

export const updateStudent = async (
  id: string,
  input: UpdateStudentInput,
  schoolId: string
) => {
  const updateData: Record<string, any> = { ...input };
  if (input.firstName || input.lastName) {
    const existing = await getStudentById(id, schoolId);
    if (existing) {
      const fName = input.firstName || (existing as any).firstName;
      const lName = input.lastName || (existing as any).lastName;
      updateData.name = `${fName} ${lName}`.trim();
    }
  }

  if (isDBConnected()) {
    const updated = await Student.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      throw new Error('Student not found or access denied.');
    }
    return updated;
  }

  const index = localDemoStore.findIndex((s) => s._id === id);
  if (index === -1) {
    throw new Error('Student not found.');
  }

  localDemoStore[index] = {
    ...localDemoStore[index],
    ...updateData,
    updatedAt: new Date(),
  };
  return localDemoStore[index];
};

export const archiveStudent = async (id: string, schoolId: string) => {
  if (isDBConnected()) {
    const archived = await Student.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: { status: 'Archived' } },
      { new: true }
    ).lean();
    if (!archived) {
      throw new Error('Student not found.');
    }
    return archived;
  }

  const student = localDemoStore.find((s) => s._id === id);
  if (!student) {
    throw new Error('Student not found.');
  }
  student.status = 'Archived';
  return student;
};

export const resetDemoStore = () => {
  localDemoStore = [...DEMO_STUDENTS];
};
