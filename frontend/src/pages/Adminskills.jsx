// src/pages/AdminSkills.jsx
// Skills & Wilayas management — now persisted in MongoDB.
// Add/delete skills and wilayas. Changes are visible immediately to students and companies.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Btn from '../components/Btn';
import NotificationBell from '../components/NotificationBell';
import { DocIcon, ChartIcon, UsersIcon, SearchIcon, CheckIcon } from '../components/Icons';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const PlusIcon  = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>;
const TrashIcon = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>;

const CATEGORIES = ['Frontend', 'Backend', 'Mobile', 'DevOps', 'Database', 'Language', 'Other'];

const adminNavItems = [
  { id: 'dashboard',  label: 'Dashboard',        icon: <ChartIcon /> },
  { id: 'pending',    label: 'Pending Requests',  icon: <DocIcon /> },
  { id: 'documents',  label: 'Documents',         icon: <DocIcon /> },
  { id: 'users',      label: 'Manage Users',      icon: <UsersIcon /> },
  { id: 'skills',     label: 'Skills & Wilayas',  icon: <ChartIcon /> },
];

// Category badge colors
const CAT_COLORS = {
  Frontend: { bg: 'rgba(124,58,237,.1)',  color: '#7c3aed' },
  Backend:  { bg: 'rgba(16,185,129,.1)',  color: '#10b981' },
  Mobile:   { bg: 'rgba(6,182,212,.1)',   color: '#06b6d4' },
  DevOps:   { bg: 'rgba(249,115,22,.1)',  color: '#f97316' },
  Database: { bg: 'rgba(245,158,11,.1)',  color: '#f59e0b' },
  Language: { bg: 'rgba(225,29,72,.1)',   color: '#e11d48' },
  Other:    { bg: 'rgba(100,116,139,.1)', color: '#64748b' },
};

export default function AdminSkills() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [tab, setTab]         = useState('skills');
  // Full objects from DB: skills → [{_id, name, category}], wilayas → [{_id, code, name}]
  const [skills,  setSkills]  = useState([]);
  const [wilayas, setWilayas] = useState([]);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [skillModal,  setSkillModal]  = useState(false);
  const [wilayaModal, setWilayaModal] = useState(false);
  const [newSkill,    setNewSkill]    = useState({ name: '', category: 'Other' });
  const [newWilaya,   setNewWilaya]   = useState({ name: '', code: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { _id, type, name }
  const [saving, setSaving]           = useState(false);
  const [error,  setError]            = useState('');

  // Load skills and wilayas from MongoDB via admin routes
  const fetchData = async () => {
    try {
      const [skillsRes, wilayasRes] = await Promise.all([
        api.get('/admin/skills'),
        api.get('/admin/wilayas'),
      ]);
      setSkills(wilayasRes.data.data  || []);   // kept separate
      setSkills(skillsRes.data.data   || []);
      setWilayas(wilayasRes.data.data || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [skillsRes, wilayasRes] = await Promise.all([
          api.get('/admin/skills'),
          api.get('/admin/wilayas'),
        ]);
        setSkills(skillsRes.data.data   || []);
        setWilayas(wilayasRes.data.data || []);
      } catch (err) { console.error(err.message); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  // ── Add skill ──
  const handleAddSkill = async () => {
    setError('');
    if (!newSkill.name.trim()) { setError('Skill name is required.'); return; }
    setSaving(true);
    try {
      const res = await api.post('/admin/skills', { name: newSkill.name.trim(), category: newSkill.category });
      setSkills(res.data.data || []);
      setNewSkill({ name: '', category: 'Other' });
      setSkillModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add skill.');
    } finally { setSaving(false); }
  };

  // ── Add wilaya ──
  const handleAddWilaya = async () => {
    setError('');
    if (!newWilaya.name.trim()) { setError('Wilaya name is required.'); return; }
    setSaving(true);
    try {
      const res = await api.post('/admin/wilayas', { name: newWilaya.name.trim(), code: newWilaya.code.trim() });
      setWilayas(res.data.data || []);
      setNewWilaya({ name: '', code: '' });
      setWilayaModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add wilaya.');
    } finally { setSaving(false); }
  };

  // ── Delete by MongoDB _id ──
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === 'skill') {
        const res = await api.delete(`/admin/skills/${deleteConfirm._id}`);
        setSkills(res.data.data || []);
      } else {
        const res = await api.delete(`/admin/wilayas/${deleteConfirm._id}`);
        setWilayas(res.data.data || []);
      }
      setDeleteConfirm(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete.');
    }
  };

  const filteredSkills  = skills.filter(s  => s.name?.toLowerCase().includes(search.toLowerCase()));
  const filteredWilayas = wilayas.filter(w => w.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="dashboard">
      {/* SIDEBAR */}
      <aside className="sidebar sidebar--admin">
        <div className="sidebar__logo"><Logo /></div>
        <nav className="sidebar__nav">
          {adminNavItems.map(item => (
            <button key={item.id}
              className={`sidebar__nav-item ${item.id === 'skills' ? 'sidebar__nav-item--active-admin' : ''}`}
              onClick={() => {
                if (item.id === 'dashboard') navigate('/admin/dashboard');
                if (item.id === 'pending')   navigate('/admin/pending');
                if (item.id === 'documents') navigate('/admin/documents');
                if (item.id === 'users')     navigate('/admin/users');
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

      {/* MAIN */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <p className="dashboard-header__greeting admin-greeting">Configuration ✦</p>
            <h1 className="dashboard-header__title">Skills & Locations</h1>
          </div>
          <div className="dashboard-header__actions">
            <NotificationBell />
            {tab === 'skills'
              ? <button className="btn--admin-validate" onClick={() => { setError(''); setNewSkill({ name: '', category: 'Other' }); setSkillModal(true); }}><PlusIcon /> Add Skill</button>
              : <button className="btn--admin-validate" onClick={() => { setError(''); setNewWilaya({ name: '', code: '' }); setWilayaModal(true); }}><PlusIcon /> Add Wilaya</button>
            }
          </div>
        </div>

        {/* Stats */}
        <div className="applications-stats" style={{ marginBottom: 28 }}>
          <div className="app-stat"><div className="app-stat__value">{skills.length}</div><div className="app-stat__label">Total Skills</div></div>
          <div className="app-stat"><div className="app-stat__value">{wilayas.length}</div><div className="app-stat__label">Wilayas</div></div>
          <div className="app-stat"><div className="app-stat__value" style={{ color: '#e11d48' }}>{CATEGORIES.length}</div><div className="app-stat__label">Categories</div></div>
        </div>

        {/* Info banner */}
        <div className="catalog-info-banner">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
          Skills and wilayas added here are immediately available for students (CV, search filters) and companies (offer creation).
        </div>

        {/* Tabs + Search */}
        <div className="candidates-filters" style={{ marginBottom: 20 }}>
          <div className="applications-filters applications-filters--no-margin">
            <button className={`app-filter ${tab === 'skills'  ? 'app-filter--active' : ''}`} onClick={() => { setTab('skills');  setSearch(''); }}>
              Skills ({skills.length})
            </button>
            <button className={`app-filter ${tab === 'wilayas' ? 'app-filter--active' : ''}`} onClick={() => { setTab('wilayas'); setSearch(''); }}>
              Wilayas ({wilayas.length})
            </button>
          </div>
          <div className="search-bar" style={{ flex: 1, maxWidth: 320, padding: '8px 16px' }}>
            <SearchIcon />
            <input className="search-bar__input" placeholder={`Search ${tab}...`} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? <div className="loading-text">Loading...</div> : (

          tab === 'skills' ? (
            /* SKILLS TABLE */
            <div className="admin-table-card">
              <div className="admin-table-header">
                <span className="admin-table-header__cell" style={{ flex: 3 }}>Skill Name</span>
                <span className="admin-table-header__cell" style={{ flex: 2 }}>Category</span>
                <span className="admin-table-header__cell" style={{ flex: 2, textAlign: 'right' }}>Actions</span>
              </div>
              {filteredSkills.length === 0 ? (
                <div className="applications-empty" style={{ border: 'none', padding: 40 }}>
                  <h3 style={{ fontSize: 16, color: '#0f0f1a' }}>No skills found</h3>
                </div>
              ) : filteredSkills.map(skill => {
                const c = CAT_COLORS[skill.category] || CAT_COLORS.Other;
                return (
                  <div key={skill._id} className="admin-table-row">
                    <div className="admin-table-row__cell" style={{ flex: 3 }}>
                      <span className="admin-table-row__skill-name">{skill.name}</span>
                    </div>
                    <div className="admin-table-row__cell" style={{ flex: 2 }}>
                      <span className="admin-cat-badge" style={{ background: c.bg, color: c.color }}>
                        {skill.category}
                      </span>
                    </div>
                    <div className="admin-table-row__cell admin-table-row__actions" style={{ flex: 2 }}>
                      <button className="admin-icon-btn admin-icon-btn--delete"
                        onClick={() => setDeleteConfirm({ _id: skill._id, type: 'skill', name: skill.name })}>
                        <TrashIcon /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          ) : (
            /* WILAYAS TABLE */
            <div className="admin-table-card">
              <div className="admin-table-header">
                <span className="admin-table-header__cell" style={{ flex: 3 }}>Wilaya Name</span>
                <span className="admin-table-header__cell" style={{ flex: 1, textAlign: 'center' }}>Code</span>
                <span className="admin-table-header__cell" style={{ flex: 2, textAlign: 'right' }}>Actions</span>
              </div>
              {filteredWilayas.length === 0 ? (
                <div className="applications-empty" style={{ border: 'none', padding: 40 }}>
                  <h3 style={{ fontSize: 16, color: '#0f0f1a' }}>No wilayas found</h3>
                </div>
              ) : filteredWilayas.map(w => (
                <div key={w._id} className="admin-table-row">
                  <div className="admin-table-row__cell" style={{ flex: 3 }}>
                    <div className="admin-wilaya-icon">{w.name.charAt(0)}</div>
                    <span className="admin-table-row__skill-name">{w.name}</span>
                  </div>
                  <div className="admin-table-row__cell" style={{ flex: 1, justifyContent: 'center' }}>
                    <span className="admin-table-row__code">{w.code}</span>
                  </div>
                  <div className="admin-table-row__cell admin-table-row__actions" style={{ flex: 2 }}>
                    <button className="admin-icon-btn admin-icon-btn--delete"
                      onClick={() => setDeleteConfirm({ _id: w._id, type: 'wilaya', name: w.name })}>
                      <TrashIcon /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>

      {/* ADD SKILL MODAL */}
      {skillModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSkillModal(false); }}>
          <div className="modal-box">
            <h3 className="modal-box__title">Add New Skill</h3>
            <p className="modal-box__text" style={{ marginBottom: 20 }}>
              This skill will immediately appear in student CV builder, search filters, and company offer forms.
            </p>
            <div style={{ marginBottom: 16 }}>
              <label className="modal-field-label">Skill Name *</label>
              <input className="input modal-dark-input" placeholder="e.g. Kubernetes"
                value={newSkill.name} onChange={e => setNewSkill(s => ({ ...s, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleAddSkill()} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="modal-field-label">Category</label>
              <select className="input cv-select modal-dark-input" value={newSkill.category}
                onChange={e => setNewSkill(s => ({ ...s, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#1e1e2e' }}>{c}</option>)}
              </select>
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <div className="modal-box__actions">
              <Btn variant="outline" style={{ flex: 1 }} onClick={() => setSkillModal(false)}>Cancel</Btn>
              <button className="btn--admin-validate"
                style={{ flex: 2, padding: 13, borderRadius: 10, justifyContent: 'center' }}
                onClick={handleAddSkill} disabled={saving}>
                {saving ? 'Adding...' : <><CheckIcon /> Add Skill</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD WILAYA MODAL */}
      {wilayaModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setWilayaModal(false); }}>
          <div className="modal-box">
            <h3 className="modal-box__title">Add New Wilaya</h3>
            <p className="modal-box__text" style={{ marginBottom: 20 }}>
              This wilaya will appear in all location dropdowns across the platform.
            </p>
            <div style={{ marginBottom: 16 }}>
              <label className="modal-field-label">Wilaya Name *</label>
              <input className="input modal-dark-input" placeholder="e.g. Béjaïa"
                value={newWilaya.name} onChange={e => setNewWilaya(w => ({ ...w, name: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="modal-field-label">Wilaya Code</label>
              <input className="input modal-dark-input" placeholder="e.g. 06"
                value={newWilaya.code} onChange={e => setNewWilaya(w => ({ ...w, code: e.target.value }))} />
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <div className="modal-box__actions">
              <Btn variant="outline" style={{ flex: 1 }} onClick={() => setWilayaModal(false)}>Cancel</Btn>
              <button className="btn--admin-validate"
                style={{ flex: 2, padding: 13, borderRadius: 10, justifyContent: 'center' }}
                onClick={handleAddWilaya} disabled={saving}>
                {saving ? 'Adding...' : <><CheckIcon /> Add Wilaya</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-box__title">Delete {deleteConfirm.type === 'skill' ? 'Skill' : 'Wilaya'}?</h3>
            <p className="modal-box__text">
              Deleting <strong style={{ color: '#f1f5f9' }}>"{deleteConfirm.name}"</strong> will remove it from all dropdowns and filters. This cannot be undone.
            </p>
            <div className="modal-box__actions">
              <Btn variant="outline" style={{ flex: 1 }} onClick={() => setDeleteConfirm(null)}>Cancel</Btn>
              <button className="btn--confirm-delete" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}