import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

const classSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  grade: z.string().min(1, 'Grade is required'),
  section: z.string().min(1, 'Section is required'),
  roomNo: z.string().optional(),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1').default(40),
  classTeacher: z.string().optional(),
  status: z.enum(['Active', 'Archived']).default('Active'),
});

export type ClassFormData = z.infer<typeof classSchema>;

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClassFormData) => Promise<void>;
  initialData?: any;
  isLoading?: boolean;
}

export const ClassFormModal: React.FC<ClassFormModalProps> = ({
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
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema) as any,
    defaultValues: {
      name: '5A',
      grade: 'Grade 5',
      section: 'A',
      roomNo: '101',
      capacity: 40,
      classTeacher: '',
      status: 'Active',
    },
  });

  const grade = watch('grade');
  const section = watch('section');

  useEffect(() => {
    if (!initialData && grade && section) {
      const gNum = grade.replace(/\D/g, '');
      setValue('name', `${gNum}${section}`);
    }
  }, [grade, section, initialData, setValue]);

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        grade: initialData.grade || 'Grade 5',
        section: initialData.section || 'A',
        roomNo: initialData.roomNo || '',
        capacity: initialData.capacity || 40,
        classTeacher: initialData.classTeacher || '',
        status: initialData.status || 'Active',
      });
    } else {
      reset({
        name: '5A',
        grade: 'Grade 5',
        section: 'A',
        roomNo: '101',
        capacity: 40,
        classTeacher: '',
        status: 'Active',
      });
    }
  }, [initialData, isOpen, reset]);

  const handleFormSubmit = async (data: ClassFormData) => {
    await onSubmit(data);
    onClose();
  };

  const gradeOptions = [
    { value: 'Grade 1', label: 'Grade 1' },
    { value: 'Grade 2', label: 'Grade 2' },
    { value: 'Grade 3', label: 'Grade 3' },
    { value: 'Grade 4', label: 'Grade 4' },
    { value: 'Grade 5', label: 'Grade 5' },
    { value: 'Grade 6', label: 'Grade 6' },
    { value: 'Grade 7', label: 'Grade 7' },
    { value: 'Grade 8', label: 'Grade 8' },
    { value: 'Grade 9', label: 'Grade 9' },
    { value: 'Grade 10', label: 'Grade 10' },
    { value: 'Grade 11', label: 'Grade 11' },
    { value: 'Grade 12', label: 'Grade 12' },
  ];

  const sectionOptions = [
    { value: 'A', label: 'Section A' },
    { value: 'B', label: 'Section B' },
    { value: 'C', label: 'Section C' },
    { value: 'D', label: 'Section D' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Class / Section' : 'Create Class / Section'}
      description="Configure grade levels, section rooms, student capacity, and class teacher."
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Grade Level *"
            options={gradeOptions}
            {...register('grade')}
            error={errors.grade?.message}
          />

          <Select
            label="Section *"
            options={sectionOptions}
            {...register('section')}
            error={errors.section?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Display Name *"
            placeholder="e.g. 5A"
            {...register('name')}
            error={errors.name?.message}
          />

          <Input
            label="Room Number"
            placeholder="e.g. Room 101"
            {...register('roomNo')}
            error={errors.roomNo?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Student Capacity *"
            type="number"
            min={1}
            max={100}
            {...register('capacity')}
            error={errors.capacity?.message}
          />

          <Input
            label="Assigned Class Teacher"
            placeholder="e.g. Ananya Sen"
            {...register('classTeacher')}
            error={errors.classTeacher?.message}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {initialData ? 'Update Class' : 'Create Class'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
