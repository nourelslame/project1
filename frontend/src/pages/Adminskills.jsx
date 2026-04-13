// src/pages/AdminSkills.jsx
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

const adminNavItems = [
  { id: 'dashboard',  label: 'Dashboard',        icon: <ChartIcon /> },
  { id: 'pending',    label: 'Pending Requests',  icon: <DocIcon /> },
  { id: 'documents',  label: 'Documents',         icon: <DocIcon /> },
  { id: 'users',      label: 'Manage Users',      icon: <UsersIcon /> },
  { id: 'skills',     label: 'Skills & Wilayas',  icon: <ChartIcon /> },
];

export default function AdminSkills() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [tab, setTab]             = useState('skills');
  const [skills, setSkills]       = useState([]);
  const [wilayas, setWilayas]     = useState([]);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);

  // Add modals
  const [skillModal, setSkillModal]   = useState(false);
  const [wilayaModal, setWilayaModal] = useState(false);
  const [newSkillName, setNewSkillName]   = useState('');
  const [newWilayaName, setNewWilayaName] = useState('');
  const [newWilayaCode, setNewWilayaCode] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load skills and wilayas from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillsRes, wilayasRes] = await Promise.all([
          api.get('/admin/skills'),
          api.get('/admin/wilayas'),
        ]);
        setSkills(skillsRes.data.data || []);
        setWilayas(wilayasRes.data.data || []);
      } catch (err) { console.error(err.message); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // Add a new skill
  const handleAddSkill = async () => {
    if (!newSkillName.trim()) return;
    setSaving(true);
    try {
      const res = await api.post('/admin/skills', { name: newSkillName.trim() });
      setSkills(res.data.data || []);
      setNewSkillName('');
      setSkillModal(false);
    } catch (err) { alert(err.response?.data?.message || 'Failed to add skill.'); }
    finally { setSaving(false); }
  };

  // Delete a skill by name
  const handleDeleteSkill = async (name) => {
    try {
      const res = await api.delete(`/admin/skills/${encodeURIComponent(name)}`);
      setSkills(res.data.data || []);
      setDeleteConfirm(null);
    } catch (err) { alert(err.response?.data?.message || 'Failed to delete.'); }
  };

  // Add a new wilaya
  const handleAddWilaya = async () => {
    if (!newWilayaName.trim()) return;
    setSaving(true);
    try {
      const res = await api.post('/admin/wilayas', { id: newWilayaCode.trim(), name: newWilayaName.trim() });
      setWilayas(res.data.data || []);
      setNewWilayaName(''); setNewWilayaCode('');
      setWilayaModal(false);
    } catch (err) { alert(err.response?.data?.message || 'Failed to add wilaya.'); }
    finally { setSaving(false); }
  };

  // Delete a wilaya by id
  const handleDeleteWilaya = async (id) => {
    try {
      const res = await api.delete(`/admin/wilayas/${id}`);
      setWilayas(res.data.data || []);
      setDeleteConfirm(null);
    } catch (err) { alert(err.response?.data?.message || 'Failed to delete.'); }
  };

  const filteredSkills  = skills.filter(s  => s.toLowerCase().includes(search.toLowerCase()));
  const filteredWilayas = wilayas.filter(w => w.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="dashboard">
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
            <p className="dashboard-header__greeting admin-greeting">Configuration ✦</p>
            <h1 className="dashboard-header__title">Skills & Locations</h1>
          </div>
          <div className="dashboard-header__actions">
            <NotificationBell />
            {tab === 'skills'
              ? <button className="btn--admin-validate" onClick={() => setSkillModal(true)}><PlusIcon /> Add Skill</button>
              : <button className="btn--admin-validate" onClick={() => setWilayaModal(true)}><PlusIcon /> Add Wilaya</button>
            }
          </div>
        </div>

        {/* Stats */}
        <div className="applications-stats" style={{ marginBottom: 28 }}>
          <div className="app-stat"><div className="app-stat__value">{skills.length}</div><div className="app-stat__label">Total Skills</div></div>
          <div className="app-stat"><div className="app-stat__value">{wilayas.length}</div><div className="app-stat__label">Wilayas</div></div>
        </div>

        {/* Tabs + Search */}
        <div className="candidates-filters" style={{ marginBottom: 20 }}>
          <div className="applications-filters applications-filters--no-margin">
            <button className={`app-filter ${tab === 'skills' ? 'app-filter--active' : ''}`} onClick={() => { setTab('skills'); setSearch(''); }}>
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

          /* SKILLS TABLE */
          tab === 'skills' ? (
            <div className="admin-table-card">
              <div className="admin-table-header">
                <span className="admin-table-header__cell" style={{ flex: 4 }}>Skill Name</span>
                <span className="admin-table-header__cell" style={{ flex: 2, textAlign: 'right' }}>Actions</span>
              </div>
              {filteredSkills.length === 0 ? (
                <div className="applications-empty" style={{ border: 'none', padding: '40px' }}>
                  <h3 className="applications-empty__title" style={{ fontSize: 16 }}>No skills found</h3>
                </div>
              ) : filteredSkills.map((skill, i) => (
                <div key={i} className="admin-table-row">
                  <div className="admin-table-row__cell" style={{ flex: 4 }}>
                    <span className="admin-table-row__skill-name">{skill}</span>
                  </div>
                  <div className="admin-table-row__cell admin-table-row__actions" style={{ flex: 2 }}>
                    <button className="admin-icon-btn admin-icon-btn--delete"
                      onClick={() => setDeleteConfirm({ type: 'skill', key: skill, name: skill })}>
                      <TrashIcon /> Delete
                    </button>
                  </div>
                </div>
              ))}
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
                <div className="applications-empty" style={{ border: 'none', padding: '40px' }}>
                  <h3 className="applications-empty__title" style={{ fontSize: 16 }}>No wilayas found</h3>
                </div>
              ) : filteredWilayas.map((w, i) => (
                <div key={i} className="admin-table-row">
                  <div className="admin-table-row__cell" style={{ flex: 3 }}>
                    <div className="admin-wilaya-icon">{w.name.charAt(0)}</div>
                    <span className="admin-table-row__skill-name">{w.name}</span>
                  </div>
                  <div className="admin-table-row__cell" style={{ flex: 1, justifyContent: 'center' }}>
                    <span className="admin-table-row__code">{w.id}</span>
                  </div>
                  <div className="admin-table-row__cell admin-table-row__actions" style={{ flex: 2 }}>
                    <button className="admin-icon-btn admin-icon-btn--delete"
                      onClick={() => setDeleteConfirm({ type: 'wilaya', key: w.id, name: w.name })}>
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
            <div style={{ marginBottom: 24 }}>
              <label style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Skill Name *</label>
              <input className="input" placeholder="e.g. Kubernetes" value={newSkillName} onChange={e => setNewSkillName(e.target.value)}
                style={{ background: 'rgba(255,255,255,.05)', borderColor: 'rgba(255,255,255,.1)', color: '#f1f5f9' }} />
            </div>
            <div className="modal-box__actions">
              <Btn variant="outline" style={{ flex: 1 }} onClick={() => setSkillModal(false)}>Cancel</Btn>
              <button className="btn--admin-validate" style={{ flex: 2, padding: '13px', borderRadius: 10, justifyContent: 'center' }}
                onClick={handleAddSkill} disabled={!newSkillName.trim() || saving}>
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
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Wilaya Name *</label>
              <input className="input" placeholder="e.g. Béjaïa" value={newWilayaName} onChange={e => setNewWilayaName(e.target.value)}
                style={{ background: 'rgba(255,255,255,.05)', borderColor: 'rgba(255,255,255,.1)', color: '#f1f5f9' }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Code</label>
              <input className="input" placeholder="e.g. 06" value={newWilayaCode} onChange={e => setNewWilayaCode(e.target.value)}
                style={{ background: 'rgba(255,255,255,.05)', borderColor: 'rgba(255,255,255,.1)', color: '#f1f5f9' }} />
            </div>
            <div className="modal-box__actions">
              <Btn variant="outline" style={{ flex: 1 }} onClick={() => setWilayaModal(false)}>Cancel</Btn>
              <button className="btn--admin-validate" style={{ flex: 2, padding: '13px', borderRadius: 10, justifyContent: 'center' }}
                onClick={handleAddWilaya} disabled={!newWilayaName.trim() || saving}>
                {saving ? 'Adding...' : <><CheckIcon /> Add Wilaya</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-box__title">Delete {deleteConfirm.type === 'skill' ? 'Skill' : 'Wilaya'}?</h3>
            <p className="modal-box__text">
              Are you sure you want to delete <strong style={{ color: '#f1f5f9' }}>"{deleteConfirm.name}"</strong>? This action cannot be undone.
            </p>
            <div className="modal-box__actions">
              <Btn variant="outline" style={{ flex: 1 }} onClick={() => setDeleteConfirm(null)}>Cancel</Btn>
              <button className="btn--confirm-delete"
                onClick={() => deleteConfirm.type === 'skill' ? handleDeleteSkill(deleteConfirm.key) : handleDeleteWilaya(deleteConfirm.key)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}