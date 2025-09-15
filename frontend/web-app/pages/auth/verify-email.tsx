import { useEffect, useState } from 'react';
import Card, { CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { verifyEmail } from '../../lib/api';

export default function VerifyEmail() {
  const { show } = useToast();
  const [email, setEmail] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = new URL(window.location.href);
      const e = u.searchParams.get('email');
      if (e) setEmail(e);
    }
  }, []);
  return (
    <main>
      <h1>Email Verification</h1>
      <Card>
        <CardHeader title="ยืนยันอีเมล" />
        <div style={{ padding: 10, display: 'grid', gap: 10 }}>
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <Button onClick={async () => {
            try {
              await verifyEmail(email);
              show({ title: 'ยืนยันสำเร็จ', variant: 'success' });
            } catch (e: any) {
              show({ title: 'ยืนยันไม่สำเร็จ', description: e.message || String(e), variant: 'error' });
            }
          }} disabled={!email}>Verify</Button>
        </div>
      </Card>
    </main>
  );
}
