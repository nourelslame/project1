// src/pages/Companyprofile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Btn from '../components/Btn';
import NotificationBell from '../components/NotificationBell';
import { FieldLabel } from '../components/Input';
import { ArrowRight, ChartIcon, BuildingIcon, CheckIcon, UsersIcon, BriefcaseIcon } from '../components/Icons';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const GlobeIcon  = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const MailIcon   = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const MapPinIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;

const navItems = [
  { id: 'dashboard',  label: 'Dashboard',     icon: <ChartIcon /> },
  { id: 'profile',    label: 'Company Info',  icon: <BuildingIcon /> },
  { id: 'offers',     label: 'Manage Offers', icon: <BriefcaseIcon /> },
  { id: 'candidates', label: 'Candidates',    icon: <UsersIcon /> },
];

const wilayas = ['Algiers','Sétif','Oran','Constantine','Annaba','Batna','Béjaïa','Blida','Tizi Ouzou','Jijel','Mostaganem','Médéa','Bouira','Chlef','Skikda'];

export default function CompanyProfile() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '', description: '', wilaya: '', website: '', email: '', phone: '', linkedin: '',
  });

  // Load company profile from backend on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/company/profile');
        const c = res.data.data;
        setForm({
          name:        c.name        || '',
          description: c.description || '',
          wilaya:      c.wilaya      || '',
          website:     c.website     || '',
          email:       c.email       || c.userId?.email || '',
          phone:       c.phone       || '',
          linkedin:    c.linkedin    || '',
        });
      } catch (err) { console.error(err.message); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  // Save updated company profile to backend
  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/company/profile', form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save. Please try again.');
    } finally { setSaving(false); }
  };

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  if (loading) return <div className="loading-text">Loading profile...</div>;

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar__logo"><Logo /></div>
        <nav className="sidebar__nav">
          {navItems.map(item => (
            <button key={item.id}
              className={`sidebar__nav-item ${item.id === 'profile' ? 'sidebar__nav-item--active' : ''}`}
              onClick={() => {
                if (item.id === 'dashboard')  navigate('/company/dashboard');
                if (item.id === 'offers')     navigate('/company/offers');
                if (item.id === 'candidates') navigate('/company/candidates');
              }}>
              <span className="sidebar__nav-icon">{item.icon}</span>
              <span className="sidebar__nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar__user">
          <div className="sidebar__avatar" style={{ background: 'rgba(16,185,129,.2)', color: '#10b981' }}>
            {(form.name || 'C').charAt(0).toUpperCase()}
          </div>
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">{form.name || 'Company'}</div>
            <div className="sidebar__user-role">Company · {form.wilaya}</div>
          </div>
          <button className="sidebar__logout" onClick={() => { logout(); navigate('/'); }} title="Logout">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <p className="dashboard-header__greeting">Settings ✦</p>
            <h1 className="dashboard-header__title">Company Information</h1>
          </div>
          <div className="dashboard-header__actions">
            <NotificationBell />
            <Btn variant={saved ? 'destructive' : 'primary'} style={{ padding: '10px 24px', fontSize: '14px', minWidth: 140, transition: 'all .3s' }} onClick={handleSave}>
              {saving ? 'Saving...' : saved ? <><CheckIcon /> Saved!</> : <>Save Changes <ArrowRight /></>}
            </Btn>
          </div>
        </div>

        <div className="cv-grid">
          {/* LEFT: Quick preview */}
          <div className="cv-sidebar-panel">
            <div className="cv-avatar-card">
              <div className="cv-avatar" style={{ background: 'rgba(16,185,129,.15)', borderRadius: 16, overflow: 'hidden' }}>
                <span className="cv-avatar__initials" style={{ color: '#10b981', fontSize: 28, fontWeight: 800 }}>
                  {(form.name || 'C').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="cv-avatar__name">{form.name || 'Company Name'}</div>
              <div className="cv-avatar__role">{form.wilaya}</div>
            </div>
            <div className="cv-skills-preview">
              <div className="cv-section-title">Quick Info</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                {[
                  { icon: <MapPinIcon />, val: form.wilaya  || '—' },
                  { icon: <MailIcon />,   val: form.email   || '—' },
                  { icon: <GlobeIcon />,  val: form.website ? form.website.replace('https://', '') : '—' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b', fontSize: 13 }}>
                    <span style={{ color: '#7c3aed' }}>{item.icon}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Form */}
          <div className="cv-form-panel">
            <div className="cv-section">
              <div className="cv-section-title"><BuildingIcon /> Company Details</div>
              <div className="cv-form-grid">
                <div className="cv-form-field">
                  <FieldLabel>Company Name</FieldLabel>
                  <input className="input" value={form.name} onChange={e => update('name', e.target.value)} />
                </div>
                <div className="cv-form-field">
                  <FieldLabel>Wilaya (Location)</FieldLabel>
                  <select className="input cv-select" value={form.wilaya} onChange={e => update('wilaya', e.target.value)}>
                    <option value="">Select wilaya...</option>
                    {wilayas.map(w => <option key={w}>{w}</option>)}
                  </select>
                </div>
              </div>
              <div className="cv-form-field" style={{ marginTop: 16 }}>
                <FieldLabel>Company Description</FieldLabel>
                <textarea className="input cv-textarea" value={form.description} onChange={e => update('description', e.target.value)} rows={4} placeholder="Describe your company, mission, and culture..." />
              </div>
            </div>

            <div className="cv-section">
              <div className="cv-section-title"><MailIcon /> Contact Information</div>
              <div className="cv-form-grid">
                <div className="cv-form-field">
                  <FieldLabel>Contact Email</FieldLabel>
                  <input className="input" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="contact@company.dz" />
                </div>
                <div className="cv-form-field">
                  <FieldLabel>Phone Number</FieldLabel>
                  <input className="input" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+213 XX XXX XXX" />
                </div>
              </div>
            </div>

            <div className="cv-section">
              <div className="cv-section-title"><GlobeIcon /> Online Presence</div>
              <div className="cv-form-grid">
                <div className="cv-form-field">
                  <FieldLabel>Website URL</FieldLabel>
                  <input className="input" value={form.website} onChange={e => update('website', e.target.value)} placeholder="https://yourcompany.dz" />
                </div>
                <div className="cv-form-field">
                  <FieldLabel>LinkedIn (optional)</FieldLabel>
                  <div className="cv-link-input">
                    <span className="cv-link-input__prefix">linkedin.com/in/</span>
                    <input className="input cv-link-input__field" placeholder="your-company"
                      value={form.linkedin}
                      onChange={e => update('linkedin', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ paddingTop: 8 }}>
              <Btn variant={saved ? '' : 'primary'} full style={{ padding: '14px', fontSize: '15px' }} onClick={handleSave}>
                {saving ? 'Saving...' : saved ? <><CheckIcon /> Changes Saved!</> : <>Save Company Info <ArrowRight /></>}
              </Btn>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}