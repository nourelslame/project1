// src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Btn from '../components/Btn';
import NotificationBell from '../components/NotificationBell';
import { ArrowRight, DocIcon, ChartIcon, UsersIcon, BuildingIcon, BriefcaseIcon, ShieldIcon } from '../components/Icons';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const adminNavItems = [
  { id: 'dashboard',  label: 'Dashboard',        icon: <ChartIcon /> },
  { id: 'pending',    label: 'Pending Requests',  icon: <DocIcon /> },
  { id: 'documents',  label: 'Documents',         icon: <DocIcon /> },
  { id: 'users',      label: 'Manage Users',      icon: <UsersIcon /> },
  { id: 'skills',     label: 'Skills & Wilayas',  icon: <ChartIcon /> },
];

function AdminSidebar({ active }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  return (
    <aside className="sidebar sidebar--admin">
      <div className="sidebar__logo"><Logo /></div>
      <nav className="sidebar__nav">
        {adminNavItems.map(item => (
          <button key={item.id}
            className={`sidebar__nav-item ${active === item.id ? 'sidebar__nav-item--active-admin' : ''}`}
            onClick={() => {
              if (item.id === 'dashboard') navigate('/admin/dashboard');
              if (item.id === 'pending')   navigate('/admin/pending');
              if (item.id === 'documents') navigate('/admin/documents');
              if (item.id === 'users')     navigate('/admin/users');
              if (item.id === 'skills')    navigate('/admin/skills');
            }}>
            <span className="sidebar__nav-icon">{item.icon}</span>
            <span className="sidebar__nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar__user">
        <div className="sidebar__avatar sidebar__avatar--admin">AD</div>
        <div className="sidebar__user-info"><div className="sidebar__user-name">Admin</div><div className="sidebar__user-role">University Admin</div></div>
        <button className="sidebar__logout" onClick={() => { logout(); navigate('/'); }} title="Logout">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
        </button>
      </div>
    </aside>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats]     = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, pendingRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/pending'),
        ]);
        setStats(statsRes.data.data);
        setPending((pendingRes.data.data || []).slice(0, 3));
      } catch (err) { console.error(err.message); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const statCards = stats ? [
    { value: stats.totalStudents,      label: 'Total Students',   color: '#e11d48', bg: 'rgba(225,29,72,.12)',  icon: <UsersIcon /> },
    { value: stats.totalOffers,        label: 'Total Offers',     color: '#f97316', bg: 'rgba(249,115,22,.12)', icon: <BriefcaseIcon /> },
    { value: stats.totalApplications,  label: 'Applications',     color: '#e11d48', bg: 'rgba(225,29,72,.10)',  icon: <DocIcon /> },
    { value: `${stats.placementRate}%`,label: 'Placement Rate',   color: '#10b981', bg: 'rgba(16,185,129,.12)', icon: <ChartIcon /> },
  ] : [];

  if (loading) return <div className="loading-text">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <AdminSidebar active="dashboard" />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <p className="dashboard-header__greeting admin-greeting">Administration ✦</p>
            <h1 className="dashboard-header__title">Welcome, Admin</h1>
          </div>
          <div className="dashboard-header__actions">
            <NotificationBell />
            <Btn variant="admin-primary" style={{ padding: '10px 20px', fontSize: '14px' }} onClick={() => navigate('/admin/pending')}>
              <DocIcon /> Pending Reviews
            </Btn>
          </div>
        </div>

        <div className="dashboard-stats">
          {statCards.map((s, i) => (
            <div key={i} className="dash-stat" style={{ animation: `fadeUp 0.5s ease ${i * 0.08}s both` }}>
              <div className="dash-stat__icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div className="dash-stat__value" style={{ color: s.color }}>{s.value}</div>
              <div className="dash-stat__label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="dashboard-grid">
          <div className="dash-card">
            <div className="dash-card__header">
              <h2 className="dash-card__title">Pending Validations</h2>
              <button className="dash-card__link admin-link" onClick={() => navigate('/admin/pending')}>View all <ArrowRight /></button>
            </div>
            <div className="dash-app-list">
              {pending.length === 0 ? <p style={{ color: '#94a3b8', fontSize: 13 }}>No pending validations.</p>
              : pending.map(app => (
                <div key={app._id} className="dash-app-item">
                  <div className="dash-app-item__logo admin-logo-bg">{(app.studentId?.firstName || 'S').charAt(0)}</div>
                  <div className="dash-app-item__info">
                    <div className="dash-app-item__role">{app.studentId?.firstName} {app.studentId?.lastName}</div>
                    <div className="dash-app-item__company">{app.offerId?.title || ''}</div>
                  </div>
                  <div className="dash-app-item__right">
                    <span className="status-badge" style={{ background: 'rgba(225,29,72,.12)', color: '#e11d48' }}>Pending</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="dash-card">
            <div className="dash-card__header">
              <h2 className="dash-card__title">Platform Stats</h2>
            </div>
            {stats && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[['Placed Students', stats.placedStudents, '#10b981'], ['Unplaced Students', stats.unplacedStudents, '#f59e0b']].map(([label, val, color]) => (
                  <div key={label} className="admin-skill-row">
                    <div className="admin-skill-row__info"><span className="admin-skill-row__name">{label}</span><span className="admin-skill-row__count">{val}</span></div>
                    <div className="admin-skill-bar">
                      <div className="admin-skill-bar__fill" style={{ width: stats.totalStudents > 0 ? `${(val/stats.totalStudents)*100}%` : '0%', background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export { AdminSidebar };