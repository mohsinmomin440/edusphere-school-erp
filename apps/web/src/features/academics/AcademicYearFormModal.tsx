import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const academicYearSchema = z
  .object({
    name: z.string().min(1, 'Academic year name is required (e.g. 2025-2026)'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    isCurrent: z.boolean().default(false),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export type AcademicYearFormData = z.infer<typeof academicYearSchema>;

interface AcademicYearFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AcademicYearFormData) => Promise<void>;
  isLoading?: boolean;
}

export const AcademicYearFormModal: React.FC<AcademicYearFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AcademicYearFormData>({
    resolver: zodResolver(academicYearSchema) as any,
    defaultValues: {
      name: '2025-2026',
      startDate: '2025-04-01',
      endDate: '2026-03-31',
      isCurrent: false,
    },
  });

  const handleFormSubmit = async (data: AcademicYearFormData) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Academic Session"
      description="Define a new academic term, calendar boundaries, and active status."
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Session Name *"
          placeholder="e.g. 2025-2026"
          {...register('name')}
          error={errors.name?.message}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date *"
            type="date"
            {...register('startDate')}
            error={errors.startDate?.message}
          />

          <Input
            label="End Date *"
            type="date"
            {...register('endDate')}
            error={errors.endDate?.message}
          />
        </div>

        <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <input
            type="checkbox"
            id="isCurrent"
            {...register('isCurrent')}
            className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
          />
          <label htmlFor="isCurrent" className="font-semibold text-slate-800 cursor-pointer">
            Set as Current Active Session
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            Save Session
          </Button>
        </div>
      </form>
    </Modal>
  );
};
