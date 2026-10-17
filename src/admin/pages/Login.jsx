import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../../services/auth';
import { useToast } from '../../context/ToastContext';
import PasswordInput from '../../components/PasswordInput';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const emailValue = String(form.get('email') || email).trim();
    const passwordValue = String(form.get('password') || password);
    if (!emailValue || !passwordValue) { setError('Enter your email and password.'); return; }
    setLoading(true);
    setError('');
    try {
      await signIn({ email: emailValue, password: passwordValue });
      navigate('/admin', { replace: true });
    } catch (err) {
      const message = err?.message || 'Login failed. Try again.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page auth-page">
      <form className="auth-form card" onSubmit={handleSubmit} noValidate>
        <h1>Admin Login</h1>
        <div className="form-group">
          <label htmlFor="admin-email">Email</label>
          <input id="admin-email" name="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="admin-password">Password</label>
          <PasswordInput id="admin-password" name="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Signing in…' : 'Login'}</button>
      </form>
      <p className="auth-hint">Pistachio Café admin — staff accounts only.</p>
    </div>
  );
}
