// src/pages/Studentdashboard.jsx
import { useState, useEffect } from 'react';
import Logo from '../components/Logo';
import Btn from '../components/Btn';
import NotificationBell from '../components/NotificationBell';
import CompanyLogo from '../components/CompanyLogo';
import { ArrowRight, SearchIcon, DocIcon, ChartIcon, GradCapIcon, CheckIcon, BuildingIcon } from '../components/Icons';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const statusConfig = {
  PENDING:   { label: 'Pending',   color: '#f59e0b', bg: 'rgba(245,158,11,.12)'  },
  ACCEPTED:  { label: 'Accepted',  color: '#10b981', bg: 'rgba(16,185,129,.12)'  },
  REFUSED:   { label: 'Refused',   color: '#ef4444', bg: 'rgba(239,68,68,.12)'   },
  VALIDATED: { label: 'Validated', color: '#7c3aed', bg: 'rgba(124,58,237,.12)'  },
};

const navItems = [
  { id: 'dashboard',    label: 'Dashboard',      icon: <ChartIcon /> },
  { id: 'cv',           label: 'My CV',           icon: <GradCapIcon /> },
  { id: 'search',       label: 'Search',          icon: <SearchIcon /> },
  { id: 'applications', label: 'My Applications', icon: <DocIcon /> },
];

// ── Slide-in Details Panel ───────────────────────────────────────────────────
function DetailsPanel({ offer, onClose, onApply, applied }) {
  const company = offer.companyId || {};

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <>
      <div className="details-backdrop" onClick={onClose} />
      <div className="details-panel">

        <div className="details-panel__topbar">
          <button className="details-panel__back" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back
          </button>
          <span className={`internship-card__type internship-card__type--${offer.type?.toLowerCase()}`}>
            {offer.type}
          </span>
        </div>

        <div className="details-panel__body">
          <div className="details-panel__hero">
            <CompanyLogo logo={company.logo} name={company.name} size={60} />
            <div>
              <h2 className="details-panel__title">{offer.title}</h2>
              <p className="details-panel__company"><BuildingIcon /> {company.name || 'Company'}</p>
            </div>
          </div>

          <div className="details-panel__meta">
            <div className="details-panel__meta-pill">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {offer.wilaya}
            </div>
            <div className="details-panel__meta-pill">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
              {offer.duration} months
            </div>
            {offer.deadline && (
              <div className="details-panel__meta-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Deadline: {new Date(offer.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
            )}
          </div>

          <div className="details-panel__divider" />

          <div className="details-panel__section">
            <h4 className="details-panel__section-title">About this Internship</h4>
            <p className="details-panel__description">{offer.description}</p>
          </div>

          {(offer.requiredSkills || []).length > 0 && (
            <div className="details-panel__section">
              <h4 className="details-panel__section-title">Required Skills</h4>
              <div className="internship-card__skills">
                {offer.requiredSkills.map((sk, i) => (
                  <span key={i} className="internship-card__skill">{sk}</span>
                ))}
              </div>
            </div>
          )}

          {company.description && (
            <div className="details-panel__section">
              <h4 className="details-panel__section-title">About {company.name}</h4>
              <p className="details-panel__description">{company.description}</p>
            </div>
          )}
        </div>

        <div className="details-panel__footer">
          <Btn
            variant={applied ? '' : 'primary'}
            style={{ width: '100%', justifyContent: 'center', opacity: applied ? 0.7 : 1 }}
            onClick={() => { if (!applied) { onApply(offer._id); onClose(); } }}
          >
            {applied ? 'Applied ✓' : 'Apply Now'}
          </Btn>
        </div>
      </div>
    </>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeNav, setActiveNav] = useState('dashboard');

  const [profile, setProfile]           = useState(null);
  const [applications, setApplications] = useState([]);
  const [recommended, setRecommended]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [appliedIds, setAppliedIds]     = useState(new Set());
  const [selectedOffer, setSelectedOffer] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, appsRes, offersRes] = await Promise.all([
          api.get('/student/profile'),
          api.get('/student/applications'),
          api.get('/offers?limit=3'),
        ]);
        setProfile(profileRes.data.data);
        setApplications(appsRes.data.data || []);
        setRecommended((offersRes.data.data || []).slice(0, 3));
      } catch (err) {
        console.error('Dashboard load error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApply = async (offerId) => {
    try {
      await api.post(`/applications/${offerId}`);
      setAppliedIds(prev => new Set([...prev, offerId]));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply.');
    }
  };

  const stats = [
    { value: applications.length,                                        label: 'Applications Sent', color: '#7c3aed', bg: 'rgba(124,58,237,.12)', icon: <DocIcon /> },
    { value: applications.filter(a => a.status === 'ACCEPTED').length,  label: 'Accepted',          color: '#10b981', bg: 'rgba(16,185,129,.12)',  icon: <CheckIcon /> },
    { value: applications.filter(a => a.status === 'PENDING').length,   label: 'Pending',           color: '#f59e0b', bg: 'rgba(245,158,11,.12)',  icon: <ChartIcon /> },
    { value: applications.filter(a => a.status === 'VALIDATED').length, label: 'Validated',         color: '#06b6d4', bg: 'rgba(6,182,212,.12)',   icon: <CheckIcon /> },
  ];

  const recentApps  = applications.slice(0, 4);
  const displayName = profile ? `${profile.firstName} ${profile.lastName}` : (user?.name || 'Student');
  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) return <div className="loading-text">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar__logo"><Logo /></div>
        <nav className="sidebar__nav">
          {navItems.map(item => (
            <button key={item.id}
              className={`sidebar__nav-item ${activeNav === item.id ? 'sidebar__nav-item--active' : ''}`}
              onClick={() => {
                setActiveNav(item.id);
                if (item.id === 'dashboard')    navigate('/student/dashboard');
                if (item.id === 'cv')           navigate('/student/cv');
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
            <div className="sidebar__user-role">Student · {profile?.level || ''} {profile?.specialty || ''}</div>
          </div>
          <button className="sidebar__logout" onClick={handleLogout} title="Logout">
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
            <p className="dashboard-header__greeting">Good morning ✦</p>
            <h1 className="dashboard-header__title">{displayName}</h1>
          </div>
          <div className="dashboard-header__actions">
            <NotificationBell />
            <Btn style={{ padding: '10px 20px', fontSize: '14px' }} onClick={() => navigate('/search')}>
              <SearchIcon /> Search Internships
            </Btn>
            <Btn variant="primary" style={{ padding: '10px 20px', fontSize: '14px' }} onClick={() => navigate('/student/cv')}>
              Update CV <ArrowRight />
            </Btn>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="dashboard-stats">
          {stats.map((s, i) => (
            <div key={i} className="dash-stat" style={{ animation: `fadeUp 0.5s ease ${i * 0.08}s both` }}>
              <div className="dash-stat__icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div className="dash-stat__value" style={{ color: s.color }}>{s.value}</div>
              <div className="dash-stat__label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="dashboard-grid">
          {/* Recent Applications */}
          <div className="dash-card">
            <div className="dash-card__header">
              <h2 className="dash-card__title">Recent Applications</h2>
              <button className="dash-card__link" onClick={() => navigate('/applications')}>View all <ArrowRight /></button>
            </div>
            <div className="dash-app-list">
              {recentApps.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: 13, padding: '12px 0' }}>No applications yet. Start searching!</p>
              ) : recentApps.map(app => {
                const s = statusConfig[app.status] || statusConfig.PENDING;
                const offerTitle  = app.offerId?.title           || 'Unknown Offer';
                const companyName = app.offerId?.companyId?.name || 'Company';
                return (
                  <div key={app._id} className="dash-app-item">
                    <div className="dash-app-item__logo">{companyName.charAt(0)}</div>
                    <div className="dash-app-item__info">
                      <div className="dash-app-item__role">{offerTitle}</div>
                      <div className="dash-app-item__company">{companyName} · {app.offerId?.wilaya || ''}</div>
                    </div>
                    <div className="dash-app-item__right">
                      <span className="status-badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                      <div className="dash-app-item__date">{new Date(app.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended Offers */}
          <div className="dash-card">
            <div className="dash-card__header">
              <h2 className="dash-card__title">Recommended For You</h2>
              <button className="dash-card__link" onClick={() => navigate('/search')}>See more <ArrowRight /></button>
            </div>
            <div className="dash-rec-list">
              {recommended.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: 13, padding: '12px 0' }}>No offers available right now.</p>
              ) : recommended.map(offer => {
                const applied = appliedIds.has(offer._id);
                return (
                  <div key={offer._id} className="dash-rec-item">
                    <div className="dash-rec-item__top">
                      <div className="dash-rec-item__logo">{(offer.companyId?.name || 'C').charAt(0)}</div>
                      <div className="dash-rec-item__info">
                        <div className="dash-rec-item__role">{offer.title}</div>
                        <div className="dash-rec-item__company">{offer.companyId?.name || ''}</div>
                      </div>
                      {/* ── Both buttons ── */}
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                   <Btn
  style={{
    padding: '7px 12px',
    fontSize: '12px',
    background: '#fff',
    color: '#1f2937',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  }}
  onClick={() => setSelectedOffer(offer)}
>
  View Details
</Btn>
                        <Btn
                          variant={applied ? '' : 'primary'}
                          style={{ padding: '7px 12px', fontSize: '12px', opacity: applied ? 0.7 : 1 }}
                          onClick={() => !applied && handleApply(offer._id)}
                        >
                          {applied ? 'Applied ✓' : 'Apply'}
                        </Btn>
                      </div>
                    </div>
                    <div className="dash-rec-item__meta">
                      <span className="dash-rec-tag">{offer.wilaya}</span>
                      <span className="dash-rec-tag">{offer.type}</span>
                      <span className="dash-rec-tag">{offer.duration} months</span>
                    </div>
                    <div className="dash-rec-item__skills">
                      {(offer.requiredSkills || []).slice(0, 3).map(sk => (
                        <span key={sk} className="skill-tag">{sk}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* ── Details Panel ── */}
      {selectedOffer && (
        <DetailsPanel
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onApply={handleApply}
          applied={appliedIds.has(selectedOffer._id)}
        />
      )}
    </div>
  );
}