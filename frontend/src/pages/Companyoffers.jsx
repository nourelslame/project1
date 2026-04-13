// src/pages/Companyoffers.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Btn from '../components/Btn';
import NotificationBell from '../components/NotificationBell';
import { FieldLabel } from '../components/Input';
import { ArrowRight, ChartIcon, BuildingIcon, CheckIcon, SearchIcon, UsersIcon, BriefcaseIcon } from '../components/Icons';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const TrashIcon = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>;
const EditIcon  = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const PlusIcon  = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>;

const ALL_SKILLS = ['React','Vue.js','Angular','Next.js','Node.js','Express','Django','FastAPI','Laravel','Spring Boot','Python','Java','JavaScript','TypeScript','PHP','C++','MongoDB','PostgreSQL','MySQL','Firebase','Docker','Git','Linux','AWS','React Native','Flutter'];
const wilayas = ['Algiers','Sétif','Oran','Constantine','Annaba','Batna','Béjaïa','Blida','Tizi Ouzou','Jijel'];
const emptyOffer = { title: '', description: '', requiredSkills: [], wilaya: 'Algiers', duration: 3, slots: 1, deadline: '', type: 'TECHNICAL', status: 'OPEN', startDate: '' };

const navItems = [
  { id: 'dashboard',  label: 'Dashboard',    icon: <ChartIcon /> },
  { id: 'profile',    label: 'Company Info', icon: <BuildingIcon /> },
  { id: 'offers',     label: 'Manage Offers',icon: <BriefcaseIcon /> },
  { id: 'candidates', label: 'Candidates',   icon: <UsersIcon /> },
];

export default function CompanyOffers() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [offers, setOffers]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterStatus, setFilter]   = useState('all');
  const [showModal, setShowModal]   = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [formData, setFormData]     = useState(emptyOffer);
  const [skillSearch, setSkillSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving]         = useState(false);

  // Load company's offers from backend
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await api.get('/company/offers');
        setOffers(res.data.data || []);
      } catch (err) { console.error(err.message); }
      finally { setLoading(false); }
    };
    fetchOffers();
  }, []);

  const filteredOffers = offers.filter(o => filterStatus === 'all' ? true : o.status === filterStatus.toUpperCase());

  const openNew = () => { setEditingId(null); setFormData(emptyOffer); setSkillSearch(''); setShowModal(true); };
  const openEdit = (offer) => {
    setEditingId(offer._id);
    setFormData({ title: offer.title, description: offer.description, requiredSkills: offer.requiredSkills || [], wilaya: offer.wilaya, duration: offer.duration, slots: offer.slots, deadline: offer.deadline?.slice(0,10) || '', type: offer.type, status: offer.status, startDate: offer.startDate?.slice(0,10) || '' });
    setSkillSearch(''); setShowModal(true);
  };

  // Create or update an offer
  const handleSave = async () => {
    if (!formData.title.trim()) { alert('Title is required.'); return; }
    setSaving(true);
    try {
      if (editingId) {
        const res = await api.put(`/offers/${editingId}`, formData);
        setOffers(prev => prev.map(o => o._id === editingId ? res.data.data : o));
      } else {
        const res = await api.post('/offers', formData);
        setOffers(prev => [res.data.data, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save offer.');
    } finally { setSaving(false); }
  };

  // Delete an offer
  const handleDelete = async (id) => {
    try {
      await api.delete(`/offers/${id}`);
      setOffers(prev => prev.filter(o => o._id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete offer.');
    }
  };

  const toggleSkill = (sk) => setFormData(f => ({
    ...f, requiredSkills: f.requiredSkills.includes(sk) ? f.requiredSkills.filter(s => s !== sk) : [...f.requiredSkills, sk]
  }));
  const upd = (key, val) => setFormData(f => ({ ...f, [key]: val }));
  const filteredSkills = ALL_SKILLS.filter(sk => sk.toLowerCase().includes(skillSearch.toLowerCase()));

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar__logo"><Logo /></div>
        <nav className="sidebar__nav">
          {navItems.map(item => (
            <button key={item.id}
              className={`sidebar__nav-item ${item.id === 'offers' ? 'sidebar__nav-item--active' : ''}`}
              onClick={() => {
                if (item.id === 'dashboard')  navigate('/company/dashboard');
                if (item.id === 'profile')    navigate('/company/profile');
                if (item.id === 'candidates') navigate('/company/candidates');
              }}>
              <span className="sidebar__nav-icon">{item.icon}</span>
              <span className="sidebar__nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar__user">
          <div className="sidebar__avatar sidebar__avatar--company">CO</div>
          <div className="sidebar__user-info"><div className="sidebar__user-name">Company</div></div>
          <button className="sidebar__logout" onClick={() => { logout(); navigate('/'); }} title="Logout">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <p className="dashboard-header__greeting">Recruitment ✦</p>
            <h1 className="dashboard-header__title">Manage Offers</h1>
          </div>
          <div className="dashboard-header__actions">
            <NotificationBell />
            <Btn variant="primary" style={{ padding: '10px 20px', fontSize: '14px' }} onClick={openNew}>
              <PlusIcon /> New Offer
            </Btn>
          </div>
        </div>

        {/* Stats */}
        <div className="applications-stats">
          <div className="app-stat"><div className="app-stat__value">{offers.length}</div><div className="app-stat__label">Total Offers</div></div>
          <div className="app-stat app-stat--green"><div className="app-stat__value">{offers.filter(o => o.status === 'OPEN').length}</div><div className="app-stat__label">Open</div></div>
          <div className="app-stat app-stat--red"><div className="app-stat__value">{offers.filter(o => o.status === 'CLOSED').length}</div><div className="app-stat__label">Closed</div></div>
          <div className="app-stat app-stat--orange"><div className="app-stat__value">{offers.reduce((s, o) => s + (o.applicants || 0), 0)}</div><div className="app-stat__label">Total Applicants</div></div>
        </div>

        {/* Filter */}
        <div className="applications-filters">
          {['all','OPEN','CLOSED'].map(f => (
            <button key={f} className={`app-filter ${filterStatus === f ? 'app-filter--active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()} ({f === 'all' ? offers.length : offers.filter(o => o.status === f).length})
            </button>
          ))}
        </div>

        {/* Offers list */}
        <div className="applications-list">
          {loading ? <div className="loading-text">Loading offers...</div>
          : filteredOffers.length === 0 ? (
            <div className="applications-empty">
              <h3 className="applications-empty__title">No offers found</h3>
              <Btn onClick={openNew}><PlusIcon /> Add New Offer</Btn>
            </div>
          ) : filteredOffers.map(offer => (
            <div key={offer._id} className="application-card">
              <div className="application-card__header">
                <div className="application-card__company">
                  <div className="application-card__logo offer-card__logo--offer"><BriefcaseIcon /></div>
                  <div className="application-card__info">
                    <h3 className="application-card__title">{offer.title}</h3>
                    <p className="application-card__company-name">{offer.wilaya} · {offer.duration} months · {offer.applicants || 0} applicants</p>
                  </div>
                </div>
                <div className="offer-card__badges">
                  <span className={`offer-status-badge offer-status-badge--${offer.status?.toLowerCase()}`}>{offer.status}</span>
                  <span className={`offer-type-badge offer-type-badge--${offer.type?.toLowerCase()}`}>{offer.type}</span>
                </div>
              </div>
              <p className="offer-card__description">{offer.description}</p>
              <div className="internship-card__skills">
                {(offer.requiredSkills || []).map((sk, i) => <span key={i} className="internship-card__skill">{sk}</span>)}
              </div>
              <div className="application-card__meta">
                <span className="application-card__date">Deadline: {new Date(offer.deadline).toLocaleDateString()}</span>
              </div>
              <div className="application-card__actions">
                <Btn style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => navigate(`/company/candidates/${offer._id}`)}>
                  View Applicants
                </Btn>
                <Btn style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => openEdit(offer)}>
                  <EditIcon /> Edit
                </Btn>
                <button className="btn--delete" onClick={() => setDeleteConfirm(offer._id)}>
                  <TrashIcon /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* DELETE MODAL */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-box__title">Delete Offer?</h3>
            <p className="modal-box__text">This action cannot be undone. All applications will also be removed.</p>
            <div className="modal-box__actions">
              <Btn variant="outline" style={{ flex: 1 }} onClick={() => setDeleteConfirm(null)}>Cancel</Btn>
              <button className="btn--confirm-delete" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-box modal-box--large">
            <h3 className="modal-box__title">{editingId ? 'Edit Offer' : 'New Internship Offer'}</h3>
            <div className="modal-field">
              <FieldLabel>Offer Title *</FieldLabel>
              <input className="input" value={formData.title} onChange={e => upd('title', e.target.value)} placeholder="e.g. Full Stack Development Internship" />
            </div>
            <div className="modal-field">
              <FieldLabel>Description</FieldLabel>
              <textarea className="input cv-textarea" rows={3} value={formData.description} onChange={e => upd('description', e.target.value)} placeholder="Describe the internship..." />
            </div>
            <div className="cv-form-grid modal-field">
              <div className="cv-form-field">
                <FieldLabel>Wilaya</FieldLabel>
                <select className="input cv-select" value={formData.wilaya} onChange={e => upd('wilaya', e.target.value)}>
                  {wilayas.map(w => <option key={w} className="c">{w}</option>)}
                </select>
              </div>
              <div className="cv-form-field">
                <FieldLabel>Type</FieldLabel>
                <select className="input cv-select" value={formData.type} onChange={e => upd('type', e.target.value)}>
                  {['TECHNICAL','RESEARCH','COMMERCIAL','OTHER'].map(t => <option key={t} className="c">{t}</option>)}
                </select>
              </div>
              <div className="cv-form-field">
                <FieldLabel>Duration (months)</FieldLabel>
                <input className="input" type="number" min={1} max={12} value={formData.duration} onChange={e => upd('duration', parseInt(e.target.value) || 1)} />
              </div>
              <div className="cv-form-field">
                <FieldLabel>Available Slots</FieldLabel>
                <input className="input" type="number" min={1} value={formData.slots} onChange={e => upd('slots', parseInt(e.target.value) || 1)} />
              </div>
              <div className="cv-form-field">
                <FieldLabel>Start Date</FieldLabel>
                <input className="input" type="date" value={formData.startDate} onChange={e => upd('startDate', e.target.value)} />
              </div>
              <div className="cv-form-field">
                <FieldLabel>Application Deadline</FieldLabel>
                <input className="input" type="date" value={formData.deadline} onChange={e => upd('deadline', e.target.value)} />
              </div>
              <div className="cv-form-field">
                <FieldLabel>Status</FieldLabel>
                <select className="input cv-select" value={formData.status} onChange={e => upd('status', e.target.value)}>
                  <option className="c" value="OPEN">Open</option>
                  <option className="c" value="CLOSED">Closed</option>
                </select>
              </div>
            </div>
            <div className="modal-skills-section">
              <FieldLabel>Required Skills</FieldLabel>
              <div className="cv-skill-search"><SearchIcon /><input className="cv-skill-search__input" placeholder="Search skills..." value={skillSearch} onChange={e => setSkillSearch(e.target.value)} /></div>
              {formData.requiredSkills.length > 0 && (
                <div className="modal-selected-skills">
                  {formData.requiredSkills.map(sk => (
                    <span key={sk} className="skill-tag skill-tag--selected">{sk}<button className="skill-tag__remove" onClick={() => toggleSkill(sk)}>✕</button></span>
                  ))}
                </div>
              )}
              <div className="cv-skills-grid">
                {filteredSkills.map(sk => {
                  const active = formData.requiredSkills.includes(sk);
                  return <button key={sk} className={`cv-skill-btn ${active ? 'cv-skill-btn--active' : ''}`} onClick={() => toggleSkill(sk)}>{active && <CheckIcon />}{sk}</button>;
                })}
              </div>
            </div>
            <div className="modal-box__actions">
              <Btn variant="outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</Btn>
              <Btn variant="primary" style={{ flex: 2 }} onClick={handleSave}>
                {saving ? 'Saving...' : editingId ? 'Save Changes' : <> Publish Offer <ArrowRight /></>}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}