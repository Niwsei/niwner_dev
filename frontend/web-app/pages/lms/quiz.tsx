import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../../components/ui/Button';
import Card, { CardHeader } from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';

const schema = z.object({
  q1: z.enum(['true', 'false'], { required_error: 'Select one' }),
  q2: z.string().min(1, 'Required'),
});

type Form = z.infer<typeof schema>;

export default function Quiz() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<Form>({ resolver: zodResolver(schema) });
  const onSubmit = (data: Form) => {
    const score = (data.q1 === 'true' ? 1 : 0) + (data.q2.trim().toLowerCase() === 'and' ? 1 : 0);
    alert(`Score: ${score}/2`);
    reset();
  };
  return (
    <main>
      <PageHeader title="Quiz" subtitle="Answer and check your understanding" />
      <Card>
        <CardHeader title="Quick Quiz" />
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: 12 }}>
            <label>1) (A && B) is true when both A and B are true.</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <label><input type="radio" value="true" {...register('q1')} /> True</label>
              <label><input type="radio" value="false" {...register('q1')} /> False</label>
            </div>
            {errors.q1 && <div style={{ color: 'salmon' }}>{errors.q1.message}</div>}
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>2) What logical operator requires both sides to be true?</label>
            <input className="card" style={{ width: '100%', padding: 8 }} placeholder="your answer" {...register('q2')} />
            {errors.q2 && <div style={{ color: 'salmon' }}>{errors.q2.message}</div>}
          </div>
          <Button type="submit" disabled={isSubmitting}>Submit</Button>
        </form>
      </Card>
    </main>
  );
}
