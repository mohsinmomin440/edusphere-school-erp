import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

const staffSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  qualification: z.string().optional(),
  joiningDate: z.string().optional(),
  status: z.enum(['Active', 'On Leave', 'Inactive']).default('Active'),
});

export type StaffFormData = z.infer<typeof staffSchema>;

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StaffFormData) => Promise<void>;
  initialData?: any;
  isLoading?: boolean;
}

export const StaffFormModal: React.FC<StaffFormModalProps> = ({
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
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema) as any,
    defaultValues: {
      employeeId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: 'Mathematics',
      designation: 'Senior Teacher',
      qualification: '',
      joiningDate: '2024-04-01',
      status: 'Active',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        employeeId: initialData.employeeId || '',
        firstName: initialData.firstName || initialData.name?.split(' ')[0] || '',
        lastName: initialData.lastName || initialData.name?.split(' ').slice(1).join(' ') || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        department: initialData.department || 'Mathematics',
        designation: initialData.designation || 'Teacher',
        qualification: initialData.qualification || '',
        joiningDate: initialData.joiningDate || '2024-04-01',
        status: initialData.status || 'Active',
      });
    } else {
      reset({
        employeeId: `EMP-${Math.floor(10 + Math.random() * 90)}`,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: 'Mathematics',
        designation: 'Senior Teacher',
        qualification: '',
        joiningDate: '2024-04-01',
        status: 'Active',
      });
    }
  }, [initialData, isOpen, reset]);

  const handleFormSubmit = async (data: StaffFormData) => {
    await onSubmit(data);
    onClose();
  };

  const departmentOptions = [
    { value: 'Academics', label: 'Academics (General)' },
    { value: 'Mathematics', label: 'Mathematics' },
    { value: 'Science', label: 'Science' },
    { value: 'English & Literature', label: 'English & Literature' },
    { value: 'Social Sciences', label: 'Social Sciences' },
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'Physical Education', label: 'Physical Education' },
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'On Leave', label: 'On Leave' },
    { value: 'Inactive', label: 'Inactive' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Staff Member' : 'Add Staff Member'}
      description="Record teacher credentials, department assignments, and contact details."
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name *"
            placeholder="e.g. Rajesh"
            {...register('firstName')}
            error={errors.firstName?.message}
          />

          <Input
            label="Last Name *"
            placeholder="e.g. Verma"
            {...register('lastName')}
            error={errors.lastName?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Employee ID *"
            placeholder="e.g. EMP-08"
            {...register('employeeId')}
            error={errors.employeeId?.message}
          />

          <Select
            label="Department *"
            options={departmentOptions}
            {...register('department')}
            error={errors.department?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email Address *"
            type="email"
            placeholder="r.verma@edusphere.com"
            {...register('email')}
            error={errors.email?.message}
          />

          <Input
            label="Phone Number *"
            placeholder="+91 98765 11002"
            {...register('phone')}
            error={errors.phone?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Designation / Role"
            placeholder="e.g. Senior Teacher, HOD"
            {...register('designation')}
            error={errors.designation?.message}
          />

          <Select
            label="Employment Status"
            options={statusOptions}
            {...register('status')}
            error={errors.status?.message}
          />
        </div>

        <Input
          label="Qualifications / Degrees"
          placeholder="e.g. M.Sc Physics, B.Ed"
          {...register('qualification')}
          error={errors.qualification?.message}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {initialData ? 'Update Staff' : 'Save Staff'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
