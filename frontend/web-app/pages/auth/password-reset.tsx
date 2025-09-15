import { useState } from 'react';
import Tabs, { Tab } from '../../components/ui/Tabs';
import Card, { CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { requestPasswordResetEmail, requestPasswordResetSms, resetPasswordWithToken, resetPasswordWithSms } from '../../lib/api';

export default function PasswordReset() {
  const { show } = useToast();
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPass, setNewPass] = useState('');

  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [smsSent, setSmsSent] = useState<string | null>(null);

  const emailTab = (
    <div style={{ display: 'grid', gap: 10 }}>
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      <Button variant="outline" onClick={async () => {
        try {
          const r = await requestPasswordResetEmail(email);
          setResetToken(r.resetToken);
          show({ title: 'ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว', description: `Demo token: ${r.resetToken}`, variant: 'success' });
        } catch (e: any) {
          show({ title: 'ขอรีเซ็ตไม่สำเร็จ', description: e.message || String(e), variant: 'error' });
        }
      }} disabled={!email}>Send Reset Link</Button>
      <Input label="Reset Token (demo)" value={resetToken} onChange={(e) => setResetToken(e.target.value)} />
      <Input label="New Password" type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
      <Button onClick={async () => {
        try {
          await resetPasswordWithToken(resetToken, newPass);
          show({ title: 'รีเซ็ตรหัสผ่านสำเร็จ', variant: 'success' });
        } catch (e: any) {
          show({ title: 'รีเซ็ตไม่สำเร็จ', description: e.message || String(e), variant: 'error' });
        }
      }} disabled={!resetToken || !newPass}>Reset Password</Button>
    </div>
  );

  const smsTab = (
    <div style={{ display: 'grid', gap: 10 }}>
      <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08x-xxx-xxxx" />
      {!smsSent ? (
        <Button variant="outline" onClick={async () => {
          try {
            const { code } = await requestPasswordResetSms(phone);
            setSmsSent(code);
            show({ title: 'ส่งรหัสทาง SMS แล้ว', description: `Demo code: ${code}`, variant: 'success' });
          } catch (e: any) {
            show({ title: 'ส่งรหัสไม่สำเร็จ', description: e.message || String(e), variant: 'error' });
          }
        }} disabled={!phone}>Send SMS Code</Button>
      ) : (
        <>
          <Input label="SMS Code" value={smsCode} onChange={(e) => setSmsCode(e.target.value)} />
          <Input label="New Password" type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
          <Button onClick={async () => {
            try {
              await resetPasswordWithSms(phone, smsCode, newPass);
              show({ title: 'เปลี่ยนรหัสผ่านสำเร็จ', description: 'กรุณาเข้าสู่ระบบด้วยรหัสใหม่', variant: 'success' });
            } catch (e: any) {
              show({ title: 'อัปเดตไม่สำเร็จ', description: e.message || String(e), variant: 'error' });
            }
          }} disabled={!smsCode || !newPass}>Confirm & Update</Button>
        </>
      )}
    </div>
  );

  const tabs: Tab[] = [
    { key: 'email', label: 'Reset via Email', content: <Card><CardHeader title="Email Reset" /><div style={{ padding: 10 }}>{emailTab}</div></Card> },
    { key: 'sms', label: 'Reset via SMS', content: <Card><CardHeader title="SMS Reset" /><div style={{ padding: 10 }}>{smsTab}</div></Card> },
  ];

  return (
    <main>
      <h1>Password Reset</h1>
      <Tabs tabs={tabs} />
    </main>
  );
}
