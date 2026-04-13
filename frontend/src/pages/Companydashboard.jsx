// src/pages/Companydashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Btn from '../components/Btn';
import NotificationBell from '../components/NotificationBell';
import { ArrowRight, DocIcon, ChartIcon, BuildingIcon, CheckIcon, UsersIcon, BriefcaseIcon } from '../components/Icons';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const statusConfig = {
  PENDING:   { label: 'Pending',  color: '#f59e0b', bg: 'rgba(245,158,11,.12)' },
  ACCEPTED:  { label: 'Accepted', color: '#10b981', bg: 'rgba(16,185,129,.12)' },
  REFUSED:   { label: 'Refused',  color: '#ef4444', bg: 'rgba(239,68,68,.12)'  },
  VALIDATED: { label: 'Validated',color: '#7c3aed', bg: 'rgba(124,58,237,.12)' },
};

const navItems = [
  { id: 'dashboard',  label: 'Dashboard',    icon: <ChartIcon /> },
  { id: 'profile',    label: 'Company Info', icon: <BuildingIcon /> },
  { id: 'offers',     label: 'Manage Offers',icon: <BriefcaseIcon /> },
  { id: 'candidates', label: 'Candidates',   icon: <UsersIcon /> },
];

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeNav, setActiveNav] = useState('dashboard');

  const [company, setCompany]           = useState(null);
  const [offers, setOffers]             = useState([]);
  const [allApplications, setAllApps]   = useState([]);
  const [loading, setLoading]           = useState(true);

  // Fetch company profile, offers, and candidates for the first offer
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, offersRes] = await Promise.all([
          api.get('/company/profile'),
          api.get('/company/offers'),
        ]);
        setCompany(profileRes.data.data);
        const fetchedOffers = offersRes.data.data || [];
        setOffers(fetchedOffers);

        // Fetch candidates for all offers and merge
        if (fetchedOffers.length > 0) {
          const appPromises = fetchedOffers.slice(0, 3).map(o =>
            api.get(`/company/candidates/${o._id}`).then(r => r.data.data || []).catch(() => [])
          );
          const results = await Promise.all(appPromises);
          setAllApps(results.flat());
        }
      } catch (err) {
        console.error('Dashboard load error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { value: offers.filter(o => o.status === 'OPEN').length,                      label: 'Active Offers',      color: '#7c3aed', bg: 'rgba(124,58,237,.12)', icon: <BriefcaseIcon /> },
    { value: offers.reduce((s, o) => s + (o.applicants || 0), 0),                 label: 'Total Applications', color: '#10b981', bg: 'rgba(16,185,129,.12)',  icon: <DocIcon /> },
    { value: allApplications.filter(a => a.status === 'PENDING').length,           label: 'Pending Review',     color: '#f59e0b', bg: 'rgba(245,158,11,.12)',  icon: <ChartIcon /> },
    { value: allApplications.filter(a => a.status === 'ACCEPTED' || a.status === 'VALIDATED').length, label: 'Accepted', color: '#06b6d4', bg: 'rgba(6,182,212,.12)', icon: <CheckIcon /> },
  ];

  const companyName = company?.name || user?.name || 'Company';

  if (loading) return <div className="loading-text">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar__logo"><Logo /></div>
        <nav className="sidebar__nav">
          {navItems.map(item => (
            <button key={item.id}
              className={`sidebar__nav-item ${activeNav === item.id ? 'sidebar__nav-item--active' : ''}`}
              onClick={() => {
                setActiveNav(item.id);
                if (item.id === 'dashboard')  navigate('/company/dashboard');
                if (item.id === 'profile')    navigate('/company/profile');
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
            {companyName.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">{companyName}</div>
            <div className="sidebar__user-role">Company · {company?.wilaya || ''}</div>
          </div>
          <button className="sidebar__logout" onClick={() => { logout(); navigate('/'); }} title="Logout">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <p className="dashboard-header__greeting">Welcome back ✦</p>
            <h1 className="dashboard-header__title">{companyName}</h1>
          </div>
          <div className="dashboard-header__actions">
            <NotificationBell />
            <Btn style={{ padding: '10px 20px', fontSize: '14px' }} onClick={() => navigate('/company/candidates')}>
              <UsersIcon /> View Candidates
            </Btn>
          </div>
        </div>

        <div className="dashboard-stats">
          {stats.map((s, i) => (
            <div key={i} className="dash-stat" style={{ animation: `fadeUp 0.5s ease ${i * 0.2}s both` }}>
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
              <button className="dash-card__link" onClick={() => navigate('/company/candidates')}>
                View all <ArrowRight />
              </button>
            </div>
            <div className="dash-app-list">
              {allApplications.slice(0, 4).length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: 13 }}>No applications yet.</p>
              ) : allApplications.slice(0, 4).map(app => {
                const s = statusConfig[app.status] || statusConfig.PENDING;
                const student = app.studentId || {};
                return (
                  <div key={app._id} className="dash-app-item">
                    <div className="dash-app-item__logo">{(student.firstName || 'S').charAt(0)}</div>
                    <div className="dash-app-item__info">
                      <div className="dash-app-item__role">{student.firstName} {student.lastName}</div>
                      <div className="dash-app-item__company">{student.level} · {app.offerId?.title || ''}</div>
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

          {/* Active Offers */}
          <div className="dash-card">
            <div className="dash-card__header">
              <h2 className="dash-card__title">Active Offers</h2>
              <button className="dash-card__link" onClick={() => navigate('/company/offers')}>
                Manage <ArrowRight />
              </button>
            </div>
            <div className="dash-rec-list">
              {offers.slice(0, 3).length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: 13 }}>No offers yet. Create your first offer!</p>
              ) : offers.slice(0, 3).map(offer => (
                <div key={offer._id} className="dash-rec-item">
                  <div className="dash-rec-item__top">
                    <div className="dash-rec-item__logo" style={{ background: 'rgba(16,185,129,.15)', color: '#10b981' }}>
                      <BriefcaseIcon />
                    </div>
                    <div className="dash-rec-item__info">
                      <div className="dash-rec-item__role">{offer.title}</div>
                      <div className="dash-rec-item__company">{offer.applicants || 0} applicants · Deadline {new Date(offer.deadline).toLocaleDateString()}</div>
                    </div>
                    <Btn style={{ padding: '7px 14px', fontSize: '12px', flexShrink: 0 }}
                      onClick={() => navigate(`/company/candidates/${offer._id}`)}>
                      View
                    </Btn>
                  </div>
                  <div className="dash-rec-item__meta">
                    <span className="dash-rec-tag">{offer.type}</span>
                    <span className="dash-rec-tag">{offer.wilaya}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}