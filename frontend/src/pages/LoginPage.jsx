// src/pages/LoginPage.jsx
import { useState } from 'react';
import Logo from '../components/Logo';
import Btn from '../components/Btn';
import { PasswordInput, FieldLabel } from '../components/Input';
import { StatBadge } from '../components/Cards';
import { ArrowRight } from '../components/Icons';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Send login request to the backend and redirect based on the user's role
  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.data.user, res.data.data.token);
      const role = res.data.data.user.role;
      if (role === 'STUDENT') navigate('/student/dashboard');
      else if (role === 'COMPANY') navigate('/company/dashboard');
      else if (role === 'ADMIN')   navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── LEFT ── */}
      <div className="auth-left">
        <div className="auth-left__logo"><Logo /></div>
        <h2 className="auth-left__title">
          Your future starts<br />
          <span className="auth-left__title-accent">with one click.</span>
        </h2>
        <p className="auth-left__sub">
          Connect with the right opportunities. Your next internship is waiting — sign in to explore.
        </p>
        <div className="auth-left__stats">
          <StatBadge value="2,500+" label="Students" delay={0.3} />
          <StatBadge value="180+"   label="Companies" delay={0.4} />
          <StatBadge value="95%"    label="Placement" delay={0.5} />
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div className="auth-right">
        <button className="auth-right__close" onClick={() => navigate('/')}>✕</button>
        <div className="auth-right__body">
          <div className="auth-right__heading">
            <span className="auth-right__heading-icon">✦</span>
            <span className="auth-right__heading-text">Welcome back</span>
          </div>
          <p className="auth-right__sub">Sign in to continue your journey</p>

          <div className="auth-right__field">
            <FieldLabel>Email</FieldLabel>
            <input
              className="input"
              type="email"
              placeholder="you@university.dz"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div className="auth-right__field">
            <FieldLabel>Password</FieldLabel>
            <PasswordInput
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div className="auth-options">
            <label className="checkbox-label">
              <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="checkbox-input" />
              <span className="checkbox-text">Remember me</span>
            </label>
            <button className="forgot-password-link" onClick={() => navigate('/forgot-password')}>
              Forgot password?
            </button>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <Btn variant="primary" full style={{ padding: '14px', fontSize: '15px', marginTop: '16px' }} onClick={handleLogin}>
            {loading ? 'Signing in...' : <> Sign in <ArrowRight /> </>}
          </Btn>

          <div className="divider"><div className="divider__line" /><span className="divider__text">OR</span><div className="divider__line" /></div>

          <p className="auth-right__switch">
            Don't have an account?{' '}
            <button className="auth-right__switch-btn" onClick={() => navigate('/register')}>Create one</button>
          </p>
        </div>
      </div>
    </div>
  );
}