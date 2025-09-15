import { useState } from 'react';
import Card, { CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { loginAuth, startSSO } from '../../lib/api';
import { useAuth } from '../../store/auth';

export default function Login() {
  const { show } = useToast();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);
  const setAuth = useAuth(s => s.setAuth);
  return (
    <main>
      <h1>Login</h1>
      <Card>
        <CardHeader title="เข้าสู่ระบบ" />
        <div style={{ padding: 10, display: 'grid', gap: 10 }}>
          <Input label="Email or Phone" value={id} onChange={(e) => setId(e.target.value)} placeholder="you@example.com or 08x-xxx-xxxx" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <span className="muted" style={{ fontSize: 12 }}>Remember me</span>
          </label>
          <Button onClick={async () => {
            setLoading(true);
            try {
              const r = await loginAuth(id, password);
              const ttlMs = remember ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000; // 30 days vs 8 hours
              setAuth({ token: r.token, user: r.user, remember, ttlMs });
              show({ title: 'Login success', description: r.user.email || r.user.phone || '', variant: 'success' });
            } catch (e: any) {
              show({ title: 'Login failed', description: e.message || String(e), variant: 'error' });
            } finally { setLoading(false); }
          }} disabled={loading || !id || !password}>Sign in</Button>

          <div className="muted" style={{ fontSize: 12 }}>หรือเข้าสู่ระบบด้วย</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="outline" onClick={async () => { const r = await startSSO('google'); const ttlMs = remember ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000; setAuth({ token: r.token, user: r.user, remember, ttlMs }); show({ title: 'Google SSO (mock)', description: r.user.email, variant: 'success' }); }}>Google</Button>
            <Button variant="outline" onClick={async () => { const r = await startSSO('facebook'); const ttlMs = remember ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000; setAuth({ token: r.token, user: r.user, remember, ttlMs }); show({ title: 'Facebook SSO (mock)', description: r.user.email, variant: 'success' }); }}>Facebook</Button>
            <Button variant="outline" onClick={async () => { const r = await startSSO('line'); const ttlMs = remember ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000; setAuth({ token: r.token, user: r.user, remember, ttlMs }); show({ title: 'LINE SSO (mock)', description: r.user.email, variant: 'success' }); }}>LINE</Button>
          </div>
        </div>
      </Card>
    </main>
  );
}
