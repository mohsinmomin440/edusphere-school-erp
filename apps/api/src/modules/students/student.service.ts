import { Student } from './student.model';
import { Guardian } from '../guardians/guardian.model';
import {
  CreateStudentInput,
  UpdateStudentInput,
  StudentQueryInput,
} from './student.validation';
import { isDBConnected } from '../../config/database';
import { AuthUser } from '../../middleware/auth.middleware';
import { DatabaseUnavailableError, ForbiddenError, NotFoundError } from '../../errors';

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
  user: AuthUser,
  query: StudentQueryInput
) => {
  const schoolId = user.schoolId || 'school-default';
  const { page, limit, search, class: classFilter, status, sortBy, sortOrder } = query;

  if (isDBConnected()) {
    const filter: Record<string, any> = { schoolId };

    // Multi-tenant and role-based scoping
    if (user.role === 'Parent') {
      const linkedIds = user.linkedStudentIds || [];
      const userEmail = (user.email || '').toLowerCase();
      filter.$or = [
        ...(linkedIds.length > 0 ? [{ _id: { $in: linkedIds } }] : []),
        ...(userEmail ? [{ 'guardian.email': userEmail }] : []),
      ];
      // If neither linked IDs nor guardian email match, Parent cannot see any records
      if (filter.$or.length === 0) {
        filter._id = null;
        delete filter.$or;
      }
    } else if (user.role === 'Student') {
      const targetId = user.studentProfileId || user.id;
      filter._id = targetId;
    } else if (user.role === 'Teacher') {
      if (user.assignedClasses && user.assignedClasses.length > 0) {
        filter.class = { $in: user.assignedClasses };
      }
    }

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
      const searchConditions = [
        { name: searchRegex },
        { admissionNo: searchRegex },
        { rollNo: searchRegex },
        { 'guardian.name': searchRegex },
      ];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
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
      isLive: true,
    };
  }

  // Fallback in-memory read-only preview when Atlas is disconnected
  let filtered = localDemoStore.filter(
    (s) => (s.schoolId || 'school-default') === schoolId
  );

  // Role-based filtering on demo store
  if (user.role === 'Parent') {
    const linkedIds = user.linkedStudentIds || [];
    const userEmail = (user.email || '').toLowerCase();
    filtered = filtered.filter(
      (s) =>
        linkedIds.includes(s._id) ||
        (s.guardian?.email && s.guardian.email.toLowerCase() === userEmail)
    );
  } else if (user.role === 'Student') {
    const targetId = user.studentProfileId || user.id;
    filtered = filtered.filter((s) => s._id === targetId);
  } else if (user.role === 'Teacher') {
    if (user.assignedClasses && user.assignedClasses.length > 0) {
      filtered = filtered.filter((s) => user.assignedClasses!.includes(s.class));
    }
  }

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
    isLive: false,
  };
};

export const getStudentById = async (id: string, user: AuthUser) => {
  const schoolId = user.schoolId || 'school-default';

  // Role-based quick checks
  if (user.role === 'Student') {
    const targetId = user.studentProfileId || user.id;
    if (id !== targetId) {
      throw new ForbiddenError('Forbidden: You can only view your own student record.');
    }
  }

  let student: any = null;

  if (isDBConnected()) {
    student = await Student.findOne({ _id: id, schoolId }).lean();
  } else {
    student =
      localDemoStore.find(
        (s) => s._id === id && (s.schoolId || 'school-default') === schoolId
      ) || null;
  }

  if (!student) {
    throw new NotFoundError('Student record not found.');
  }

  // Check parent linkage
  if (user.role === 'Parent') {
    const linkedIds = user.linkedStudentIds || [];
    const userEmail = (user.email || '').toLowerCase();
    const isLinked =
      linkedIds.includes(student._id.toString()) ||
      (student.guardian?.email && student.guardian.email.toLowerCase() === userEmail);
    if (!isLinked) {
      throw new ForbiddenError('Forbidden: You can only view records of your linked children.');
    }
  }

  // Check teacher class assignment
  if (user.role === 'Teacher') {
    if (user.assignedClasses && user.assignedClasses.length > 0) {
      if (!user.assignedClasses.includes(student.class)) {
        throw new ForbiddenError('Forbidden: You can only view students in your assigned classes.');
      }
    }
  }

  return student;
};

export const createStudent = async (
  input: CreateStudentInput,
  user: AuthUser
) => {
  if (!isDBConnected()) {
    throw new DatabaseUnavailableError(
      'Database unavailable: Persistent write operations require an active MongoDB connection. Configure MONGODB_URI to enable student creation.'
    );
  }

  const schoolId = user.schoolId || 'school-default';
  const fullName = `${input.firstName} ${input.lastName}`.trim();

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
};

export const updateStudent = async (
  id: string,
  input: UpdateStudentInput,
  user: AuthUser
) => {
  if (!isDBConnected()) {
    throw new DatabaseUnavailableError(
      'Database unavailable: Persistent write operations require an active MongoDB connection. Configure MONGODB_URI to enable student updates.'
    );
  }

  const schoolId = user.schoolId || 'school-default';
  const updateData: Record<string, any> = { ...input };

  if (input.firstName || input.lastName) {
    const existing = await Student.findOne({ _id: id, schoolId }).lean();
    if (existing) {
      const fName = input.firstName || (existing as any).firstName;
      const lName = input.lastName || (existing as any).lastName;
      updateData.name = `${fName} ${lName}`.trim();
    }
  }

  const updated = await Student.findOneAndUpdate(
    { _id: id, schoolId },
    { $set: updateData },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) {
    throw new NotFoundError('Student not found or access denied across school boundary.');
  }
  return updated;
};

export const archiveStudent = async (id: string, user: AuthUser) => {
  if (!isDBConnected()) {
    throw new DatabaseUnavailableError(
      'Database unavailable: Persistent write operations require an active MongoDB connection. Configure MONGODB_URI to enable archiving.'
    );
  }

  const schoolId = user.schoolId || 'school-default';
  const archived = await Student.findOneAndUpdate(
    { _id: id, schoolId },
    { $set: { status: 'Archived' } },
    { new: true }
  ).lean();

  if (!archived) {
    throw new NotFoundError('Student not found.');
  }
  return archived;
};

export const resetDemoStore = () => {
  localDemoStore = [...DEMO_STUDENTS];
};
