// src/pages/AdminUsers.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Btn from '../components/Btn';
import NotificationBell from '../components/NotificationBell';
import { DocIcon, ChartIcon, UsersIcon, SearchIcon, CheckIcon, BuildingIcon, GradCapIcon } from '../components/Icons';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const adminNavItems = [
  { id: 'dashboard',  label: 'Dashboard',        icon: <ChartIcon /> },
  { id: 'pending',    label: 'Pending Requests',  icon: <DocIcon /> },
  { id: 'documents',  label: 'Documents',         icon: <DocIcon /> },
  { id: 'users',      label: 'Manage Users',      icon: <UsersIcon /> },
  { id: 'skills',     label: 'Skills & Wilayas',  icon: <ChartIcon /> },
];

export default function AdminUsers() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [tab, setTab]               = useState('students');
  const [students, setStudents]     = useState([]);
  const [companies, setCompanies]   = useState([]);
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [viewUser, setViewUser]     = useState(null);
  const [banConfirm, setBanConfirm] = useState(null);
  const [bannedIds, setBannedIds]   = useState(new Set()); // Track locally (backend is dummy)

  // Load students and companies
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [studRes, compRes] = await Promise.all([
          api.get('/admin/users/students'),
          api.get('/admin/users/companies'),
        ]);
        setStudents(studRes.data.data || []);
        setCompanies(compRes.data.data || []);
      } catch (err) { console.error(err.message); }
      finally { setLoading(false); }
    };
    fetchUsers();
  }, []);

  // Toggle ban status
  const toggleBan = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/ban`);
      setBannedIds(prev => {
        const next = new Set(prev);
        next.has(userId) ? next.delete(userId) : next.add(userId);
        return next;
      });
      setBanConfirm(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed.');
    }
  };

  const list = (tab === 'students' ? students : companies).filter(u => {
    const name = u.firstName || u.name || u.userId?.name || '';
    const email = u.userId?.email || '';
    const q = search.toLowerCase();
    return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
  });

  return (
    <div className="dashboard">
      <aside className="sidebar sidebar--admin">
        <div className="sidebar__logo"><Logo /></div>
        <nav className="sidebar__nav">
          {adminNavItems.map(item => (
            <button key={item.id}
              className={`sidebar__nav-item ${item.id === 'users' ? 'sidebar__nav-item--active-admin' : ''}`}
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

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <p className="dashboard-header__greeting admin-greeting">Directory ✦</p>
            <h1 className="dashboard-header__title">Manage Users</h1>
          </div>
          <div className="dashboard-header__actions"><NotificationBell /></div>
        </div>

        <div className="applications-stats" style={{ marginBottom: 28 }}>
          <div className="app-stat"><div className="app-stat__value">{students.length}</div><div className="app-stat__label">Students</div></div>
          <div className="app-stat"><div className="app-stat__value">{companies.length}</div><div className="app-stat__label">Companies</div></div>
          <div className="app-stat"><div className="app-stat__value" style={{ color: '#e11d48' }}>{bannedIds.size}</div><div className="app-stat__label">Banned</div></div>
          <div className="app-stat"><div className="app-stat__value" style={{ color: '#10b981' }}>{students.length + companies.length - bannedIds.size}</div><div className="app-stat__label">Active</div></div>
        </div>

        {/* Tabs + Search */}
        <div className="candidates-filters" style={{ marginBottom: 20 }}>
          <div className="applications-filters applications-filters--no-margin">
            <button className={`app-filter ${tab === 'students' ? 'app-filter--active' : ''}`}
              onClick={() => { setTab('students'); setSearch(''); }}>
              <GradCapIcon /> Students ({students.length})
            </button>
            <button className={`app-filter ${tab === 'companies' ? 'app-filter--active' : ''}`}
              onClick={() => { setTab('companies'); setSearch(''); }}>
              <BuildingIcon /> Companies ({companies.length})
            </button>
          </div>
          <div className="search-bar" style={{ flex: 1, maxWidth: 360, padding: '8px 16px' }}>
            <SearchIcon />
            <input className="search-bar__input" placeholder={`Search ${tab}...`} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="applications-list">
          {loading ? <div className="loading-text">Loading users...</div>
          : list.length === 0 ? (
            <div className="applications-empty">
              <UsersIcon />
              <h3 className="applications-empty__title">No users found</h3>
            </div>
          ) : list.map(u => {
            const userId = u.userId?._id || u._id;
            const isBanned = bannedIds.has(userId);
            const displayName = tab === 'students'
              ? `${u.firstName || ''} ${u.lastName || ''}`.trim()
              : u.name || u.userId?.name || 'Company';
            const email = u.userId?.email || '';
            const detail = tab === 'students'
              ? `${u.level || ''} · ${u.specialty || ''} · ${u.wilaya || ''}`
              : `${u.wilaya || ''} · ${u.website || ''}`;

            return (
              <div key={u._id} className="application-card">
                <div className="application-card__header">
                  <div className="application-card__company">
                    <div className="application-card__logo"
                      style={{ background: tab === 'students' ? 'rgba(225,29,72,.15)' : 'rgba(249,115,22,.15)', color: tab === 'students' ? '#e11d48' : '#f97316' }}>
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="application-card__info">
                      <h3 className="application-card__title">{displayName}</h3>
                      <p className="application-card__company-name">{email}</p>
                    </div>
                  </div>
                  <span className="application-card__status"
                    style={isBanned
                      ? { background: 'rgba(239,68,68,.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,.2)' }
                      : { background: 'rgba(16,185,129,.12)', color: '#10b981', border: '1px solid rgba(16,185,129,.2)' }}>
                    {isBanned ? 'Banned' : 'Active'}
                  </span>
                </div>
                <div className="application-card__details">
                  <span className="application-card__detail">{detail}</span>
                  <span className="application-card__detail">Joined {new Date(u.userId?.createdAt || u.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
                <div className="application-card__actions">
                  <Btn variant="ghost" style={{ padding: '9px 18px', fontSize: '13px' }} onClick={() => setViewUser({ ...u, displayName, email, detail, isBanned })}>
                    View Details
                  </Btn>
                  <button
                    onClick={() => setBanConfirm({ userId, displayName, isBanned })}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10,
                      background: isBanned ? 'rgba(16,185,129,.08)' : 'rgba(239,68,68,.08)',
                      color: isBanned ? '#10b981' : '#ef4444',
                      border: `1.5px solid ${isBanned ? 'rgba(16,185,129,.2)' : 'rgba(239,68,68,.2)'}`,
                      cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                    }}>
                    {isBanned ? <><CheckIcon /> Unban</> : <>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M18 6 6 18M6 6l12 12"/></svg>
                      Ban User
                    </>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* VIEW DETAILS MODAL */}
      {viewUser && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setViewUser(null); }}>
          <div className="modal-box">
            <div className="cv-modal__header" style={{ marginBottom: 20 }}>
              <div className="cv-modal__avatar" style={{ background: 'rgba(225,29,72,.2)', color: '#e11d48' }}>
                {viewUser.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="cv-modal__info">
                <div className="cv-modal__name">{viewUser.displayName}</div>
                <div className="cv-modal__level">{tab === 'students' ? 'Student' : 'Company'}</div>
              </div>
            </div>
            {[['Email', viewUser.email], ['Details', viewUser.detail], ['Status', viewUser.isBanned ? 'Banned' : 'Active']].map(([label, value]) => (
              <div key={label} className="cv-modal__info-row">
                <span className="cv-modal__info-label">{label}</span>
                <span className="cv-modal__info-value" style={label === 'Status' && viewUser.isBanned ? { color: '#ef4444' } : {}}>{value}</span>
              </div>
            ))}
            <div style={{ marginTop: 24 }}>
              <Btn variant="ghost" full onClick={() => setViewUser(null)}>Close</Btn>
            </div>
          </div>
        </div>
      )}

      {/* BAN CONFIRM MODAL */}
      {banConfirm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-box__title">{banConfirm.isBanned ? 'Unban User?' : 'Ban User?'}</h3>
            <p className="modal-box__text">
              {banConfirm.isBanned
                ? `This will restore ${banConfirm.displayName}'s access.`
                : `This will suspend ${banConfirm.displayName}'s access to the platform.`}
            </p>
            <div className="modal-box__actions">
              <Btn variant="outline" style={{ flex: 1 }} onClick={() => setBanConfirm(null)}>Cancel</Btn>
              <button
                className="btn--confirm-delete"
                style={{ background: banConfirm.isBanned ? '#10b981' : '#ef4444' }}
                onClick={() => toggleBan(banConfirm.userId)}
              >
                {banConfirm.isBanned ? 'Confirm Unban' : 'Confirm Ban'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}