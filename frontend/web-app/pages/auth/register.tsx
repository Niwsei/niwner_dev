import { useState } from 'react';
import Tabs, { Tab } from '../../components/ui/Tabs';
import Card, { CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { registerWithEmail, registerWithPhone, requestPhoneCode, verifyPhoneCode, startSSO } from '../../lib/api';

export default function Register() {
  const { show } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [codeSent, setCodeSent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailTab = (
    <div style={{ display: 'grid', gap: 10 }}>
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      <Button onClick={async () => {
        setLoading(true);
        try {
          await registerWithEmail(email, password);
          show({ title: 'Registered', description: 'Please verify your email.', variant: 'success' });
        } catch (e: any) {
          show({ title: 'Register failed', description: e.message || String(e), variant: 'error' });
        } finally { setLoading(false); }
      }} disabled={loading || !email || !password}>Create Account</Button>
      <div className="muted" style={{ fontSize: 12 }}>เราจะส่งอีเมลยืนยันเพื่อเปิดใช้งานบัญชีของคุณ</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <Button variant="outline" onClick={async () => { const r = await startSSO('google'); show({ title: 'Google SSO (mock)', description: r.user.email, variant: 'success' }); }}>Continue with Google</Button>
        <Button variant="outline" onClick={async () => { const r = await startSSO('facebook'); show({ title: 'Facebook SSO (mock)', description: r.user.email, variant: 'success' }); }}>Facebook</Button>
        <Button variant="outline" onClick={async () => { const r = await startSSO('line'); show({ title: 'LINE SSO (mock)', description: r.user.email, variant: 'success' }); }}>LINE</Button>
      </div>
    </div>
  );

  const phoneTab = (
    <div style={{ display: 'grid', gap: 10 }}>
      <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08x-xxx-xxxx" />
      <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      {!codeSent ? (
        <Button onClick={async () => {
          setLoading(true);
          try {
            await registerWithPhone(phone, password);
            const { code } = await requestPhoneCode(phone);
            setCodeSent(code);
            show({ title: 'ส่งรหัส SMS แล้ว', description: `Demo code: ${code}`, variant: 'success' });
          } catch (e: any) {
            show({ title: 'ส่งรหัสไม่สำเร็จ', description: e.message || String(e), variant: 'error' });
          } finally { setLoading(false); }
        }} disabled={loading || !phone || !password}>Send SMS Code</Button>
      ) : (
        <>
          <Input label="SMS Code" value={smsCode} onChange={(e) => setSmsCode(e.target.value)} placeholder="6-digit code" />
          <Button onClick={async () => {
            setLoading(true);
            try {
              await verifyPhoneCode(phone, smsCode);
              show({ title: 'ยืนยันเบอร์สำเร็จ', variant: 'success' });
            } catch (e: any) {
              show({ title: 'รหัสไม่ถูกต้อง', description: e.message || String(e), variant: 'error' });
            } finally { setLoading(false); }
          }} disabled={loading || !smsCode}>Verify & Complete</Button>
        </>
      )}
    </div>
  );

  const tabs: Tab[] = [
    { key: 'email', label: 'Register with Email', content: <Card><CardHeader title="Email" /><div style={{ padding: 10 }}>{emailTab}</div></Card> },
    { key: 'phone', label: 'Register with Phone', content: <Card><CardHeader title="Phone" /><div style={{ padding: 10 }}>{phoneTab}</div></Card> },
  ];

  return (
    <main>
      <h1>Register</h1>
      <Tabs tabs={tabs} />
    </main>
  );
}
