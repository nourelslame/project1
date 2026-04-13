// src/pages/Companycandidates.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Logo from '../components/Logo';
import Btn from '../components/Btn';
import NotificationBell from '../components/NotificationBell';
import { ChartIcon, BuildingIcon, DocIcon, BriefcaseIcon, UsersIcon, CheckIcon } from '../components/Icons';
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

export default function CompanyCandidates() {
  const navigate = useNavigate();
  const { offerId } = useParams();          // optional — filters by offer
  const { logout } = useAuth();

  const [offers, setOffers]           = useState([]);
  const [candidates, setCandidates]   = useState([]);
  const [filterOffer, setFilterOffer] = useState(offerId || 'all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading]         = useState(true);
  const [selectedCandidate, setSelected] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Load offers first, then load candidates for each offer
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const offersRes = await api.get('/company/offers');
        const myOffers = offersRes.data.data || [];
        setOffers(myOffers);

        // Fetch candidates for all offers in parallel
        const results = await Promise.all(
          myOffers.map(o =>
            api.get(`/company/candidates/${o._id}`)
              .then(r => (r.data.data || []).map(a => ({ ...a, offerTitle: o.title, offerId: o._id })))
              .catch(() => [])
          )
        );
        setCandidates(results.flat());
      } catch (err) {
        console.error('Failed to load candidates:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Accept or refuse a candidate application
  const handleAction = async (appId, action) => {
    setActionLoading(true);
    try {
      const endpoint = `/company/candidates/${appId}/${action}`;  // accept or refuse
      await api.put(endpoint);
      const newStatus = action === 'accept' ? 'ACCEPTED' : 'REFUSED';
      setCandidates(prev => prev.map(c => c._id === appId ? { ...c, status: newStatus } : c));
      if (selectedCandidate?._id === appId) setSelected(prev => ({ ...prev, status: newStatus }));
      setConfirmAction(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = candidates.filter(c => {
    const matchOffer  = filterOffer === 'all'  || c.offerId?.toString() === filterOffer;
    const matchStatus = filterStatus === 'all' || c.status === filterStatus.toUpperCase();
    return matchOffer && matchStatus;
  });

  const stats = {
    total:    candidates.length,
    pending:  candidates.filter(c => c.status === 'PENDING').length,
    accepted: candidates.filter(c => c.status === 'ACCEPTED').length,
    refused:  candidates.filter(c => c.status === 'REFUSED').length,
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar__logo"><Logo /></div>
        <nav className="sidebar__nav">
          {navItems.map(item => (
            <button key={item.id}
              className={`sidebar__nav-item ${item.id === 'candidates' ? 'sidebar__nav-item--active' : ''}`}
              onClick={() => {
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
            <p className="dashboard-header__greeting">Applications ✦</p>
            <h1 className="dashboard-header__title">Candidates</h1>
          </div>
          <div className="dashboard-header__actions"><NotificationBell /></div>
        </div>

        {/* Stats */}
        <div className="applications-stats">
          <div className="app-stat"><div className="app-stat__value">{stats.total}</div><div className="app-stat__label">Total</div></div>
          <div className="app-stat app-stat--orange"><div className="app-stat__value">{stats.pending}</div><div className="app-stat__label">Pending</div></div>
          <div className="app-stat app-stat--green"><div className="app-stat__value">{stats.accepted}</div><div className="app-stat__label">Accepted</div></div>
          <div className="app-stat app-stat--red"><div className="app-stat__value">{stats.refused}</div><div className="app-stat__label">Refused</div></div>
        </div>

        {/* Filters */}
        <div className="candidates-filters">
          <div className="applications-filters applications-filters--no-margin">
            {['all','PENDING','ACCEPTED','REFUSED'].map(s => (
              <button key={s} className={`app-filter ${filterStatus === s ? 'app-filter--active' : ''}`} onClick={() => setFilterStatus(s)}>
                {s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          {offers.length > 0 && (
            <select className="input candidates-filter__select" value={filterOffer} onChange={e => setFilterOffer(e.target.value)}
              style={{ width: 'auto', background: '#fff', color: '#0f0f1a', border: '1.5px solid #e2e8f0' }}>
              <option value="all">All Offers</option>
              {offers.map(o => <option key={o._id} value={o._id}>{o.title}</option>)}
            </select>
          )}
        </div>

        {/* Candidates list */}
        <div className="applications-list">
          {loading ? <div className="loading-text">Loading candidates...</div>
          : filtered.length === 0 ? (
            <div className="applications-empty">
              <UsersIcon />
              <h3 className="applications-empty__title">No candidates found</h3>
              <p className="applications-empty__text">Try adjusting your filters</p>
            </div>
          ) : filtered.map(candidate => {
            const s = statusConfig[candidate.status] || statusConfig.PENDING;
            const student = candidate.studentId || {};
            return (
              <div key={candidate._id} className="application-card">
                <div className="application-card__header">
                  <div className="application-card__company">
                    <div className="application-card__logo" style={{ background: 'linear-gradient(135deg,#7c3aed,#9333ea)', color: '#fff' }}>
                      {(student.firstName || 'S').charAt(0)}
                    </div>
                    <div className="application-card__info">
                      <h3 className="application-card__title">{student.firstName} {student.lastName}</h3>
                      <p className="application-card__company-name">{student.level} · {student.specialty} · {student.university || ''}</p>
                    </div>
                  </div>
                  <span className="candidate-status-badge candidate-status-badge--pending" style={{ background: s.bg, color: s.color }}>
                    {s.label}
                  </span>
                </div>

                <div className="candidate-card__offer-row">
                  <span className="candidate-card__offer-badge">{candidate.offerTitle || ''}</span>
                </div>

                <div className="candidate-card__skills">
                  {(student.skills || []).map((sk, i) => <span key={i} className="skill-tag">{sk}</span>)}
                </div>

                <div className="application-card__meta">
                  <span className="application-card__date">Applied {new Date(candidate.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="application-card__actions">
                  <Btn variant="ghost" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => setSelected(candidate)}>
                    View CV
                  </Btn>
                  {candidate.status === 'PENDING' && (
                    <>
                      <button className="btn--accept" onClick={() => setConfirmAction({ id: candidate._id, action: 'accept', name: `${student.firstName} ${student.lastName}` })}>
                        <CheckIcon /> Accept
                      </button>
                      <button className="btn--refuse" onClick={() => setConfirmAction({ id: candidate._id, action: 'refuse', name: `${student.firstName} ${student.lastName}` })}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
                        Refuse
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* CV PREVIEW MODAL */}
      {selectedCandidate && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="modal-box modal-box--large">
            <div className="cv-modal__header">
              <div className="cv-modal__avatar">{(selectedCandidate.studentId?.firstName || 'S').charAt(0)}</div>
              <div className="cv-modal__info">
                <div className="cv-modal__name">{selectedCandidate.studentId?.firstName} {selectedCandidate.studentId?.lastName}</div>
                <div className="cv-modal__level">{selectedCandidate.studentId?.level} · {selectedCandidate.studentId?.specialty}</div>
                <div className="cv-modal__university">{selectedCandidate.studentId?.university}</div>
              </div>
              <span style={{ background: statusConfig[selectedCandidate.status]?.bg, color: statusConfig[selectedCandidate.status]?.color, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                {statusConfig[selectedCandidate.status]?.label}
              </span>
            </div>
            {[['Bio', selectedCandidate.studentId?.bio], ['Wilaya', selectedCandidate.studentId?.wilaya], ['Phone', selectedCandidate.studentId?.phone]].filter(([,v]) => v).map(([label, value]) => (
              <div key={label} className="cv-modal__info-row">
                <span className="cv-modal__info-label">{label}</span>
                <span className="cv-modal__info-value">{value}</span>
              </div>
            ))}
            <div className="cv-modal__skills-section">
              <div className="cv-modal__skills-title">Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {(selectedCandidate.studentId?.skills || []).map(sk => <span key={sk} className="skill-tag">{sk}</span>)}
              </div>
            </div>
            {selectedCandidate.studentId?.githubLink && (
              <a className="cv-modal__github-link" href={`https://${selectedCandidate.studentId.githubLink}`} target="_blank" rel="noreferrer">
                GitHub: {selectedCandidate.studentId.githubLink}
              </a>
            )}
            <div className="cv-modal__actions">
              {selectedCandidate.status === 'PENDING' && (
                <>
                  <button className="btn--cv-accept" onClick={() => { setSelected(null); setConfirmAction({ id: selectedCandidate._id, action: 'accept', name: `${selectedCandidate.studentId?.firstName}` }); }}>
                    <CheckIcon /> Accept
                  </button>
                  <button className="btn--cv-refuse" onClick={() => { setSelected(null); setConfirmAction({ id: selectedCandidate._id, action: 'refuse', name: `${selectedCandidate.studentId?.firstName}` }); }}>
                    Refuse
                  </button>
                </>
              )}
              <Btn variant="ghost" style={{ flex: 1 }} onClick={() => setSelected(null)}>Close</Btn>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM ACTION MODAL */}
      {confirmAction && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-box__title">{confirmAction.action === 'accept' ? 'Accept Candidate?' : 'Refuse Candidate?'}</h3>
            <p className="modal-box__text">
              {confirmAction.action === 'accept'
                ? `Accepting ${confirmAction.name} will notify the student and send a validation request to the admin.`
                : `Are you sure you want to refuse ${confirmAction.name}'s application?`}
            </p>
            <div className="modal-box__actions">
              <Btn variant="outline" style={{ flex: 1 }} onClick={() => setConfirmAction(null)}>Cancel</Btn>
              <button
                className={`btn--confirm-action ${confirmAction.action === 'accept' ? 'btn--confirm-action--accepted' : 'btn--confirm-action--rejected'}`}
                onClick={() => handleAction(confirmAction.id, confirmAction.action)}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : confirmAction.action === 'accept' ? 'Confirm Accept' : 'Confirm Refuse'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}