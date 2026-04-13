// src/pages/Studentcv.jsx
import { useState, useEffect } from 'react';
import Logo from '../components/Logo';
import Btn from '../components/Btn';
import { FieldLabel } from '../components/Input';
import { ArrowRight, SearchIcon, DocIcon, ChartIcon, GradCapIcon, BuildingIcon, CheckIcon } from '../components/Icons';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ALL_SKILLS = [
  'React', 'Vue.js', 'Angular', 'Next.js',
  'Node.js', 'Express', 'Django', 'FastAPI', 'Laravel', 'Spring Boot',
  'Python', 'Java', 'JavaScript', 'TypeScript', 'PHP', 'C++',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Firebase',
  'Docker', 'Git', 'Linux', 'AWS',
];

const navItems = [
  { id: 'dashboard',    label: 'Dashboard',      icon: <ChartIcon /> },
  { id: 'cv',           label: 'My CV',           icon: <GradCapIcon /> },
  { id: 'search',       label: 'Search',          icon: <SearchIcon /> },
  { id: 'applications', label: 'My Applications', icon: <DocIcon /> },
];

export default function StudentCV() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [saved, setSaved]           = useState(false);
  const [saving, setSaving]         = useState(false);
  const [loading, setLoading]       = useState(true);
  const [skills, setSkills]         = useState([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', wilaya: '',
    level: 'L3', specialty: '', githubLink: '', portfolioLink: '', bio: '',
  });

  // Load the student profile from the backend on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/student/profile');
        const s = res.data.data;
        setForm({
          firstName:    s.firstName    || '',
          lastName:     s.lastName     || '',
          phone:        s.phone        || '',
          wilaya:       s.wilaya       || '',
          level:        s.level        || 'L3',
          specialty:    s.specialty    || '',
          githubLink:   s.githubLink   || '',
          portfolioLink: s.portfolioLink || '',
          bio:          s.bio          || '',
        });
        setSkills(s.skills || []);
      } catch (err) {
        console.error('Failed to load profile:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const toggleSkill = (sk) =>
    setSkills(prev => prev.includes(sk) ? prev.filter(s => s !== sk) : [...prev, sk]);

  // Save updated profile to the backend
  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/student/profile', { ...form, skills });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const filteredSkills = ALL_SKILLS.filter(sk => sk.toLowerCase().includes(skillSearch.toLowerCase()));
  const displayName = `${form.firstName} ${form.lastName}`.trim() || user?.name || 'Student';

  if (loading) return <div className="loading-text">Loading profile...</div>;

  return (
    <div className="dashboard">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar__logo"><Logo /></div>
        <nav className="sidebar__nav">
          {navItems.map(item => (
            <button key={item.id}
              className={`sidebar__nav-item ${item.id === 'cv' ? 'sidebar__nav-item--active' : ''}`}
              onClick={() => {
                if (item.id === 'dashboard')    navigate('/student/dashboard');
                if (item.id === 'search')       navigate('/search');
                if (item.id === 'applications') navigate('/applications');
              }}>
              <span className="sidebar__nav-icon">{item.icon}</span>
              <span className="sidebar__nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar__user">
          <div className="sidebar__avatar">{displayName.charAt(0).toUpperCase()}</div>
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">{displayName}</div>
            <div className="sidebar__user-role">Student · {form.level} {form.specialty}</div>
          </div>
          <button className="sidebar__logout" onClick={() => { logout(); navigate('/'); }} title="Logout">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <p className="dashboard-header__greeting">Profile ✦</p>
            <h1 className="dashboard-header__title">My Digital CV</h1>
          </div>
          <div className="dashboard-header__actions">
            <Btn variant={saved ? 'destructive' : 'primary'}
              style={{ padding: '10px 24px', fontSize: '14px', minWidth: 140, transition: 'all .3s' }}
              onClick={handleSave}>
              {saving ? 'Saving...' : saved ? <><CheckIcon /> Saved!</> : <>Save Changes <ArrowRight /></>}
            </Btn>
          </div>
        </div>

        <div className="cv-grid">
          {/* LEFT: Preview */}
          <div className="cv-sidebar-panel">
            <div className="cv-avatar-card">
              <div className="cv-avatar">
                <span className="cv-avatar__initials">{displayName.charAt(0).toUpperCase()}</span>
              </div>
              <div className="cv-avatar__name">{displayName}</div>
              <div className="cv-avatar__role">{form.specialty}</div>
              <div className="cv-avatar__level">{form.level}</div>
            </div>
            <div className="cv-skills-preview">
              <div className="cv-section-title">Selected Skills</div>
              <div className="cv-skills-preview__list">
                {skills.length === 0 ? <span style={{ color: '#475569', fontSize: 13 }}>No skills selected yet</span>
                  : skills.map(sk => (
                    <span key={sk} className="skill-tag skill-tag--selected">
                      {sk}<button className="skill-tag__remove" onClick={() => toggleSkill(sk)}>✕</button>
                    </span>
                  ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Form */}
          <div className="cv-form-panel">
            {/* Personal Info */}
            <div className="cv-section">
              <div className="cv-section-title"><GradCapIcon /> Personal Information</div>
              <div className="cv-form-grid">
                <div className="cv-form-field">
                  <FieldLabel>First Name</FieldLabel>
                  <input className="input" value={form.firstName} onChange={e => update('firstName', e.target.value)} />
                </div>
                <div className="cv-form-field">
                  <FieldLabel>Last Name</FieldLabel>
                  <input className="input" value={form.lastName} onChange={e => update('lastName', e.target.value)} />
                </div>
                <div className="cv-form-field">
                  <FieldLabel>Phone Number</FieldLabel>
                  <input className="input" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+213 XX XXX XXX" />
                </div>
                <div className="cv-form-field">
                  <FieldLabel>Wilaya</FieldLabel>
                  <input className="input" value={form.wilaya} onChange={e => update('wilaya', e.target.value)} placeholder="Sétif" />
                </div>
              </div>
              <div className="cv-form-field" style={{ marginTop: 16 }}>
                <FieldLabel>Bio / Short Description</FieldLabel>
                <textarea className="input cv-textarea" value={form.bio} onChange={e => update('bio', e.target.value)} rows={3} placeholder="Tell companies about yourself..." />
              </div>
            </div>

            {/* Academic Info */}
            <div className="cv-section">
              <div className="cv-section-title"><DocIcon /> Academic Information</div>
              <div className="cv-form-grid">
                <div className="cv-form-field">
                  <FieldLabel>Academic Level</FieldLabel>
                  <select className="input cv-select" value={form.level} onChange={e => update('level', e.target.value)}>
                    {['L1','L2','L3','M1','M2'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div className="cv-form-field">
                  <FieldLabel>Specialty / Program</FieldLabel>
                  <input className="input" value={form.specialty} onChange={e => update('specialty', e.target.value)} placeholder="Computer Science – IT" />
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="cv-section">
              <div className="cv-section-title"><BuildingIcon /> Links & Portfolio</div>
              <div className="cv-form-grid">
                <div className="cv-form-field">
                  <FieldLabel>GitHub Profile</FieldLabel>
                  <div className="cv-link-input">
                    <span className="cv-link-input__prefix">github.com/</span>
                    <input className="input cv-link-input__field" placeholder="your-username"
                      value={form.githubLink.replace('github.com/', '')}
                      onChange={e => update('githubLink', 'github.com/' + e.target.value)} />
                  </div>
                </div>
                <div className="cv-form-field">
                  <FieldLabel>Portfolio URL</FieldLabel>
                  <input className="input" placeholder="https://yourportfolio.com" value={form.portfolioLink} onChange={e => update('portfolioLink', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="cv-section">
              <div className="cv-section-title"><ChartIcon /> Technical Skills</div>
              <p className="cv-section-sub">Select all technologies you are comfortable with</p>
              <div className="cv-skill-search">
                <SearchIcon />
                <input className="cv-skill-search__input" placeholder="Search skills..." value={skillSearch} onChange={e => setSkillSearch(e.target.value)} />
              </div>
              <div className="cv-skills-grid">
                {filteredSkills.map(sk => {
                  const active = skills.includes(sk);
                  return (
                    <button key={sk} className={`cv-skill-btn ${active ? 'cv-skill-btn--active' : ''}`} onClick={() => toggleSkill(sk)}>
                      {active && <CheckIcon />}{sk}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ paddingTop: 8 }}>
              <Btn variant={saved ? 'destructive' : 'primary'} full style={{ padding: '14px', fontSize: '15px' }} onClick={handleSave}>
                {saving ? 'Saving...' : saved ? <><CheckIcon /> Changes Saved!</> : <>Save My CV <ArrowRight /></>}
              </Btn>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}