import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signIn } from '../../lib/services/auth';
import PasswordInput from '../../lib/components/PasswordInput';
import { useToast } from '../../lib/context/ToastContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  async function handleSubmit(e) {
    e.preventDefault();
    const emailValue = email.trim();
    const passwordValue = password;
    if (!emailValue || !passwordValue) { setError('Enter your email and password.'); return; }
    setLoading(true);
    setError('');
    try {
      await signIn({ email: emailValue, password: passwordValue });
      navigate(from, { replace: true });
    } catch (err) {
      const message = err?.message || 'Login failed. Try again.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <meta name="robots" content="noindex" />
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-brand">
          <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: '0.05em' }}>Pistachio Cafe</span>
        </div>
        <h1>Staff sign in</h1>
        <div className="form-group">
          <label htmlFor="admin-email">Email address</label>
          <input id="admin-email" name="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="admin-password">Password</label>
          <PasswordInput id="admin-password" name="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn btn-primary btn-block" disabled={loading} type="submit">{loading ? 'Signing in…' : 'Sign in'}</button>
        <p className="auth-hint">Staff accounts only.</p>
        <p className="auth-robots">Pistachio Cafe admin · Spintex, Accra</p>
      </form>
    </div>
  );
}
