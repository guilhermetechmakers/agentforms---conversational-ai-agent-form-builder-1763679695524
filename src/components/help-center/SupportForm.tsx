import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useCreateSupportRequest, useTrackInteraction } from '@/hooks/useHelpCenter';
import { getHelpCenterSessionId } from '@/api/help-center';
import { Loader2 } from 'lucide-react';

const supportFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  urgency: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
});

type SupportFormData = z.infer<typeof supportFormSchema>;

export function SupportForm() {
  const { mutate: createRequest, isPending } = useCreateSupportRequest();
  const { mutate: trackInteraction } = useTrackInteraction();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<SupportFormData>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      urgency: 'normal',
    },
  });

  const urgency = watch('urgency');

  const onSubmit = (data: SupportFormData) => {
    createRequest(
      {
        ...data,
        status: 'open',
      },
      {
        onSuccess: () => {
          reset();
          trackInteraction({
            session_id: getHelpCenterSessionId(),
            interaction_type: 'form_submit',
            section: 'contact',
            metadata: { form_type: 'support_request' },
          });
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Your name"
          className={errors.name ? 'border-danger' : ''}
        />
        {errors.name && (
          <p className="text-sm text-danger">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="your.email@example.com"
          className={errors.email ? 'border-danger' : ''}
        />
        {errors.email && (
          <p className="text-sm text-danger">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject *</Label>
        <Input
          id="subject"
          {...register('subject')}
          placeholder="Brief description of your issue"
          className={errors.subject ? 'border-danger' : ''}
        />
        {errors.subject && (
          <p className="text-sm text-danger">{errors.subject.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="urgency">Urgency</Label>
        <Select
          value={urgency}
          onValueChange={(value) => setValue('urgency', value as SupportFormData['urgency'])}
        >
          <SelectTrigger id="urgency">
            <SelectValue placeholder="Select urgency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low - General inquiry</SelectItem>
            <SelectItem value="normal">Normal - Standard support</SelectItem>
            <SelectItem value="high">High - Needs attention soon</SelectItem>
            <SelectItem value="urgent">Urgent - Critical issue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Please provide as much detail as possible about your issue..."
          rows={6}
          className={errors.description ? 'border-danger' : ''}
        />
        {errors.description && (
          <p className="text-sm text-danger">{errors.description.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Support Request'
        )}
      </Button>
    </form>
  );
}
