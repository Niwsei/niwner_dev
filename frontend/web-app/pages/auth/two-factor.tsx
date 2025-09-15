import { useState } from 'react';
import Card, { CardHeader, CardMeta } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { setupMfa, verifyMfa, generateBackupCodes, consumeBackupCode } from '../../lib/api';
import { useAuth } from '../../store/auth';

export default function TwoFactor() {
  const { show } = useToast();
  const auth = useAuth();
  const defaultId = auth.user?.id ? String(auth.user.id) : '';
  const [userId, setUserId] = useState(defaultId);
  const [secret, setSecret] = useState<string>('');
  const [otpauth, setOtpauth] = useState<string>('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [backupCodeInput, setBackupCodeInput] = useState('');

  const doSetup = async () => {
    setLoading(true);
    try {
      const uid = Number(userId || '0');
      const r = await setupMfa(uid);
      setSecret(r.secret);
      setOtpauth(r.otpauth);
      show({ title: 'สร้างรหัส MFA สำเร็จ', variant: 'success' });
    } catch (e: any) {
      show({ title: 'ตั้งค่า MFA ไม่สำเร็จ', description: e.message || String(e), variant: 'error' });
    } finally { setLoading(false); }
  };

  const doVerify = async () => {
    setLoading(true);
    try {
      const uid = Number(userId || '0');
      await verifyMfa(uid, code);
      show({ title: 'ยืนยัน MFA สำเร็จ', variant: 'success' });
    } catch (e: any) {
      show({ title: 'รหัสไม่ถูกต้อง', description: e.message || String(e), variant: 'error' });
    } finally { setLoading(false); }
  };

  const doGenerateBackup = async () => {
    setLoading(true);
    try {
      const uid = Number(userId || auth.user?.id || '0');
      const r = await generateBackupCodes(uid);
      setBackupCodes(r.codes);
      show({ title: 'สร้าง Backup Codes สำเร็จ', variant: 'success' });
    } catch (e: any) {
      show({ title: 'สร้าง Backup Codes ไม่สำเร็จ', description: e.message || String(e), variant: 'error' });
    } finally { setLoading(false); }
  };

  const doConsumeBackup = async () => {
    setLoading(true);
    try {
      const uid = Number(userId || auth.user?.id || '0');
      await consumeBackupCode(uid, backupCodeInput);
      show({ title: 'ยืนยันด้วย Backup Code สำเร็จ', variant: 'success' });
    } catch (e: any) {
      show({ title: 'โค้ดไม่ถูกต้องหรือถูกใช้แล้ว', description: e.message || String(e), variant: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <main>
      <h1>Two-Factor Authentication (MFA)</h1>
      <div className="grid">
        <div className="col-6">
          <Card>
            <CardHeader title="Setup MFA" />
            <CardMeta>รองรับ TOTP (เช่น Google Authenticator, 1Password, Authy)</CardMeta>
            <div style={{ padding: 10, display: 'grid', gap: 10 }}>
              {!auth.user && (
                <Input label="User ID (demo)" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="ใส่ User ID" />
              )}
              <Button onClick={doSetup} disabled={loading || !(userId || auth.user?.id)}>Generate Secret</Button>
              {secret && (
                <>
                  <Input label="Secret (Base32)" value={secret} readOnly />
                  <Input label="otpauth URL" value={otpauth} readOnly />
                  <div className="muted" style={{ fontSize: 12 }}>เพิ่มบัญชีในแอป Authenticator ด้วยการสแกน QR (จาก otpauth) หรือป้อน Secret</div>
                </>
              )}
            </div>
          </Card>
        </div>
        <div className="col-6">
          <Card>
            <CardHeader title="Verify Code" />
            <CardMeta>ใส่รหัสจากแอป Authenticator</CardMeta>
            <div style={{ padding: 10, display: 'grid', gap: 10 }}>
              <Input label="6-digit Code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" />
              <Button onClick={doVerify} disabled={loading || !code || !(userId || auth.user?.id)}>Verify</Button>
              <div className="muted" style={{ fontSize: 12 }}>โค้ดจะเปลี่ยนทุก 30 วินาที</div>
            </div>
          </Card>
        </div>
        <div className="col-6">
          <Card>
            <CardHeader title="Backup Codes" />
            <CardMeta>สำรองไว้ใช้กรณีฉุกเฉินเมื่อไม่สามารถเข้าถึงแอป Authenticator</CardMeta>
            <div style={{ padding: 10, display: 'grid', gap: 10 }}>
              <Button variant="outline" onClick={doGenerateBackup} disabled={loading || !(userId || auth.user?.id)}>Generate Codes</Button>
              {backupCodes && (
                <div className="card" style={{ padding: 10 }}>
                  <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>เก็บโค้ดเหล่านี้ไว้ในที่ปลอดภัย (จะแสดงครั้งเดียว)</div>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {backupCodes.map((c) => (<li key={c}><code>{c}</code></li>))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        </div>
        <div className="col-6">
          <Card>
            <CardHeader title="Use Backup Code" />
            <CardMeta>หากไม่มีรหัส TOTP ให้ใช้โค้ดสำรองหนึ่งครั้ง</CardMeta>
            <div style={{ padding: 10, display: 'grid', gap: 10 }}>
              <Input label="Backup Code" value={backupCodeInput} onChange={(e) => setBackupCodeInput(e.target.value)} placeholder="xxxxxxxxxx" />
              <Button onClick={doConsumeBackup} disabled={loading || !backupCodeInput || !(userId || auth.user?.id)}>Verify with Backup Code</Button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
