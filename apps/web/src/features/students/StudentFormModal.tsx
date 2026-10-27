import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

export interface StudentFormData {
  firstName: string;
  lastName: string;
  admissionNo: string;
  rollNo: string;
  class: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  email?: string;
  phone?: string;
  guardianName: string;
  guardianRelationship?: string;
  guardianPhone: string;
  guardianEmail?: string;
}

const studentFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  admissionNo: z.string().min(1, 'Admission number is required'),
  rollNo: z.string().min(1, 'Roll number is required'),
  class: z.string().min(1, 'Class is required'),
  gender: z.enum(['Male', 'Female', 'Other']),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  email: z.string().optional(),
  phone: z.string().optional(),
  guardianName: z.string().min(1, 'Parent/Guardian name is required'),
  guardianRelationship: z.string().optional(),
  guardianPhone: z.string().min(1, 'Guardian phone is required'),
  guardianEmail: z.string().optional(),
});

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StudentFormData) => Promise<void>;
  initialData?: any;
  isLoading?: boolean;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema) as any,
    defaultValues: {
      firstName: '',
      lastName: '',
      admissionNo: '',
      rollNo: '',
      class: '5A',
      gender: 'Male',
      dateOfBirth: '2014-01-12',
      email: '',
      phone: '',
      guardianName: '',
      guardianRelationship: 'Father',
      guardianPhone: '',
      guardianEmail: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        firstName: initialData.firstName || initialData.name?.split(' ')[0] || '',
        lastName: initialData.lastName || initialData.name?.split(' ').slice(1).join(' ') || '',
        admissionNo: initialData.admissionNo || '',
        rollNo: initialData.rollNo || '',
        class: initialData.class || '5A',
        gender: initialData.gender || 'Male',
        dateOfBirth: initialData.dateOfBirth || '2014-01-12',
        email: initialData.email || '',
        phone: initialData.phone || '',
        guardianName: initialData.guardian?.name || '',
        guardianRelationship: initialData.guardian?.relationship || 'Parent',
        guardianPhone: initialData.guardian?.phone || '',
        guardianEmail: initialData.guardian?.email || '',
      });
    } else {
      reset({
        firstName: '',
        lastName: '',
        admissionNo: `ADM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        rollNo: String(Math.floor(100 + Math.random() * 900)),
        class: '5A',
        gender: 'Male',
        dateOfBirth: '2014-01-12',
        email: '',
        phone: '',
        guardianName: '',
        guardianRelationship: 'Father',
        guardianPhone: '',
        guardianEmail: '',
      });
    }
  }, [initialData, isOpen, reset]);

  const handleFormSubmit = async (data: StudentFormData) => {
    await onSubmit(data);
    onClose();
  };

  const classOptions = [
    { value: '5A', label: 'Grade 5A' },
    { value: '7C', label: 'Grade 7C' },
    { value: '8B', label: 'Grade 8B' },
    { value: '9B', label: 'Grade 9B' },
    { value: '10A', label: 'Grade 10A' },
  ];

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Student Profile' : 'Add New Student'}
      description="Enter academic and personal details for the student record."
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="First Name *"
            placeholder="Aarav"
            {...register('firstName')}
            error={errors.firstName?.message}
          />
          <Input
            label="Last Name *"
            placeholder="Sharma"
            {...register('lastName')}
            error={errors.lastName?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Admission Number *"
            placeholder="ADM-2025-0101"
            {...register('admissionNo')}
            error={errors.admissionNo?.message}
          />
          <Input
            label="Roll Number *"
            placeholder="101"
            {...register('rollNo')}
            error={errors.rollNo?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Class *"
            options={classOptions}
            {...register('class')}
            error={errors.class?.message}
          />
          <Select
            label="Gender *"
            options={genderOptions}
            {...register('gender')}
            error={errors.gender?.message}
          />
          <Input
            label="Date of Birth *"
            type="date"
            {...register('dateOfBirth')}
            error={errors.dateOfBirth?.message}
          />
        </div>

        <div className="border-t border-slate-100 pt-3">
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Parent / Guardian Details
          </h4>
          <div className="space-y-3">
            <Input
              label="Guardian Full Name *"
              placeholder="Rahul Sharma"
              {...register('guardianName')}
              error={errors.guardianName?.message}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Guardian Phone *"
                placeholder="+91 98765 43210"
                {...register('guardianPhone')}
                error={errors.guardianPhone?.message}
              />
              <Input
                label="Guardian Email"
                placeholder="rahul.sharma@example.com"
                {...register('guardianEmail')}
                error={errors.guardianEmail?.message}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {initialData ? 'Save Changes' : 'Create Student'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
