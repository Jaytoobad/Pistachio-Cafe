import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signIn } from '../../lib/services/auth';
import PasswordInput from '../../lib/components/PasswordInput';
import { useToast } from '../../lib/context/ToastContext';
import Icon from '../components/Icon';

const LOGO_SVG = '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e) {
    e.preventDefault();
    const emailValue = email.trim();
    const passwordValue = password;
    if (!emailValue || !passwordValue) { setError('Enter your email and password.'); return; }
    setLoading(true);
    setError('');
    try {
      await signIn({ email: emailValue, password: passwordValue });
      navigate('/admin/today', { replace: true });
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
          <svg className="auth-logo" viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="var(--color-pistachio)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: LOGO_SVG }} />
          <span className="auth-wordmark">Pistachio Caf\u00e9</span>
        </div>
        <h1>Staff sign in</h1>
        <div className="form-group">
          <label htmlFor="admin-email">Email address</label>
          <input id="admin-email" name="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="field-input" />
        </div>
        <div className="form-group">
          <label htmlFor="admin-password">Password</label>
          <PasswordInput id="admin-password" name="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn btn-primary btn-block" disabled={loading} type="submit">{loading ? 'Signing in\u2026' : 'Sign in'}</button>
        <p className="auth-hint">Staff accounts only.</p>
      </form>
    </div>
  );
}
