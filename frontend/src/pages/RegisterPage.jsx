// src/pages/RegisterPage.jsx
// Registration page — only STUDENT and COMPANY roles are available.
// ADMIN account is hardcoded in the backend and cannot be registered here.
import { useState } from 'react';
import Logo from '../components/Logo';
import Btn from '../components/Btn';
import { PasswordInput, FieldLabel } from '../components/Input';
import { CheckIcon, ArrowRight, GradCapIcon, BuildingIcon } from '../components/Icons';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Only STUDENT and COMPANY — no ADMIN
  const roles = [
    {
      id: 'student',
      icon:  <GradCapIcon />,
      color: '#7c3aed',
      bg:    'rgba(124,58,237,.12)',
      label: 'Student',
      sub:   'Find & apply to internships',
    },
    {
      id: 'company',
      icon:  <BuildingIcon />,
      color: '#10b981',
      bg:    'rgba(16,185,129,.1)',
      label: 'Company',
      sub:   'Post offers & find talent',
    },
  ];

  const [role, setRole]         = useState('student');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const active = roles.find(r => r.id === role);

  // Send registration request to backend (ADMIN role blocked server-side too)
  const handleRegister = async () => {
    setError('');
    if (!name || !email || !password || !confirm) { setError('All fields are required.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return; }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        role: role.toUpperCase(),   // 'STUDENT' | 'COMPANY'
      });
      login(res.data.data.user, res.data.data.token);
      const r = res.data.data.user.role;
      if (r === 'STUDENT')  navigate('/student/dashboard');
      else if (r === 'COMPANY') navigate('/company/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--register">

      {/* ── LEFT ── */}
      <div
        className="auth-left"
        style={{
          background: `radial-gradient(ellipse 80% 70% at 20% 60%, ${active.color}22 0%, transparent 60%)`,
        }}
      >
        <div className="auth-left__logo"><Logo /></div>

        <h2 className="auth-left__title">
          Join as a<br />
          <span key={role} className="register-title-role" style={{ color: active.color }}>
            {active.label}
          </span>
        </h2>

        <p className="auth-left__sub" style={{ marginBottom: '40px' }}>
          Select your role to get a tailored experience.
        </p>

        {/* Role selector — only Student + Company */}
        <div className="role-selector">
          {roles.map((r, i) => {
            const isActive = role === r.id;
            return (
              <div
                key={r.id}
                className={`role-option ${isActive ? 'role-option--active' : ''}`}
                onClick={() => setRole(r.id)}
                style={{
                  borderColor:  isActive ? r.color : undefined,
                  background:   isActive ? r.bg    : undefined,
                  boxShadow:    isActive ? `0 4px 20px ${r.color}22` : undefined,
                  animationDelay: `${0.25 + i * 0.08}s`,
                  animation:    `fadeUp 0.5s ease ${0.25 + i * 0.08}s both`,
                }}
              >
                <div className="role-option__icon" style={{ background: r.bg, color: r.color }}>
                  {r.icon}
                </div>
                <div className="role-option__info">
                  <div className="role-option__label">{r.label}</div>
                  <div className="role-option__sub">{r.sub}</div>
                </div>
                <div className="role-option__check">
                  {isActive && <CheckIcon />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div className="auth-right">
        <button className="auth-right__close" onClick={() => navigate('/')}>✕</button>

        <div className="auth-right__body">
          <div className="auth-right__heading">
            <span className="auth-right__heading-icon">✦</span>
            <span className="auth-right__heading-text">Create account</span>
          </div>
          <p className="auth-right__sub auth-right__sub--small">Start your journey today</p>

          {/* Progress bar */}
          <div className="progress-bar">
            <div className="progress-bar__step"><div className="progress-bar__fill" /></div>
            <div className="progress-bar__step" />
            <div className="progress-bar__step" />
          </div>

          <div className="auth-right__field">
            <FieldLabel>Full Name</FieldLabel>
            <input
              className="input"
              placeholder="John Doe"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="auth-right__field">
            <FieldLabel>Email</FieldLabel>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-right__field">
            <FieldLabel>Password</FieldLabel>
            <PasswordInput
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div className="auth-right__field--last">
            <FieldLabel>Confirm Password</FieldLabel>
            <PasswordInput
              placeholder="••••••••"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <Btn
            variant="primary"
            full
            style={{ padding: '14px', fontSize: '15px' }}
            onClick={handleRegister}
          >
            {loading
              ? 'Creating account...'
              : <> Create Account <ArrowRight /> </>
            }
          </Btn>

          <div className="divider">
            <div className="divider__line" />
            <span className="divider__text">OR</span>
            <div className="divider__line" />
          </div>

          <p className="auth-right__switch">
            Already have an account?{' '}
            <button className="auth-right__switch-btn" onClick={() => navigate('/login')}>
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}