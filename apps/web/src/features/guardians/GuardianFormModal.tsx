import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

const guardianSchema = z.object({
  name: z.string().min(1, 'Guardian name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address').or(z.literal('')).optional(),
  occupation: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(['Active', 'Archived']).default('Active'),
});

export type GuardianFormData = z.infer<typeof guardianSchema>;

interface GuardianFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GuardianFormData) => Promise<void>;
  initialData?: any;
  isLoading?: boolean;
}

export const GuardianFormModal: React.FC<GuardianFormModalProps> = ({
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
  } = useForm<GuardianFormData>({
    resolver: zodResolver(guardianSchema) as any,
    defaultValues: {
      name: '',
      relationship: 'Father',
      phone: '',
      email: '',
      occupation: '',
      address: '',
      status: 'Active',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        relationship: initialData.relationship || 'Father',
        phone: initialData.phone || '',
        email: initialData.email || '',
        occupation: initialData.occupation || '',
        address: initialData.address || '',
        status: initialData.status || 'Active',
      });
    } else {
      reset({
        name: '',
        relationship: 'Father',
        phone: '',
        email: '',
        occupation: '',
        address: '',
        status: 'Active',
      });
    }
  }, [initialData, isOpen, reset]);

  const handleFormSubmit = async (data: GuardianFormData) => {
    await onSubmit(data);
    onClose();
  };

  const relationshipOptions = [
    { value: 'Father', label: 'Father' },
    { value: 'Mother', label: 'Mother' },
    { value: 'Guardian', label: 'Guardian' },
    { value: 'Other', label: 'Other Relative' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Parent / Guardian' : 'Register Parent / Guardian'}
      description="Record family contact and emergency guardian details."
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Full Name *"
          placeholder="e.g. Ramesh Patel"
          {...register('name')}
          error={errors.name?.message}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Relationship *"
            options={relationshipOptions}
            {...register('relationship')}
            error={errors.relationship?.message}
          />

          <Input
            label="Phone Number *"
            placeholder="+91 98765 43210"
            {...register('phone')}
            error={errors.phone?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email Address"
            placeholder="parent@example.com"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />

          <Input
            label="Occupation / Profession"
            placeholder="e.g. Software Engineer, Doctor"
            {...register('occupation')}
            error={errors.occupation?.message}
          />
        </div>

        <Input
          label="Residential Address"
          placeholder="e.g. 144 Green Valley, New Delhi"
          {...register('address')}
          error={errors.address?.message}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {initialData ? 'Update Record' : 'Save Guardian'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
