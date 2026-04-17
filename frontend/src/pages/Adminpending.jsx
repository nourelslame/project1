// src/pages/AdminPending.jsx — updated to show company logo
// Only change from the previous version: replaced hardcoded logo divs with <CompanyLogo />
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Btn from '../components/Btn';
import NotificationBell from '../components/NotificationBell';
import CompanyLogo from '../components/CompanyLogo';
import { DocIcon, ChartIcon, UsersIcon, CheckIcon } from '../components/Icons';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const adminNavItems = [
  { id: 'dashboard',  label: 'Dashboard',        icon: <ChartIcon /> },
  { id: 'pending',    label: 'Pending Requests',  icon: <DocIcon /> },
  { id: 'documents',  label: 'Documents',         icon: <DocIcon /> },
  { id: 'users',      label: 'Manage Users',      icon: <UsersIcon /> },
  { id: 'skills',     label: 'Skills & Wilayas',  icon: <ChartIcon /> },
];

export default function AdminPending() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [pending, setPending]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [viewItem, setViewItem]         = useState(null);
  const [rejectModal, setRejectModal]   = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionConfirm, setActionConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [doneCount, setDoneCount]       = useState({ validated: 0, rejected: 0 });

  useEffect(() => {
    api.get('/admin/pending')
      .then(res => setPending(res.data.data || []))
      .catch(err => console.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleValidate = async (appId) => {
    setActionLoading(true);
    try {
      await api.put(`/admin/validate/${appId}`);
      setPending(prev => prev.filter(p => p._id !== appId));
      setDoneCount(prev => ({ ...prev, validated: prev.validated + 1 }));
      setActionConfirm(null);
      setViewItem(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Validation failed.');
    } finally { setActionLoading(false); }
  };

  const handleReject = async (appId) => {
    if (!rejectReason.trim()) { alert('Please provide a reason.'); return; }
    setActionLoading(true);
    try {
      await api.put(`/admin/reject/${appId}`, { reason: rejectReason });
      setPending(prev => prev.filter(p => p._id !== appId));
      setDoneCount(prev => ({ ...prev, rejected: prev.rejected + 1 }));
      setRejectModal(null);
      setRejectReason('');
      setViewItem(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed.');
    } finally { setActionLoading(false); }
  };

  return (
    <div className="dashboard">
      <aside className="sidebar sidebar--admin">
        <div className="sidebar__logo"><Logo /></div>
        <nav className="sidebar__nav">
          {adminNavItems.map(item => (
            <button key={item.id}
              className={`sidebar__nav-item ${item.id === 'pending' ? 'sidebar__nav-item--active-admin' : ''}`}
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
            <p className="dashboard-header__greeting admin-greeting">Review ✦</p>
            <h1 className="dashboard-header__title">Pending Requests</h1>
          </div>
          <div className="dashboard-header__actions"><NotificationBell /></div>
        </div>

        <div className="applications-stats" style={{ marginBottom: 28 }}>
          <div className="app-stat"><div className="app-stat__value">{pending.length}</div><div className="app-stat__label">Awaiting Review</div></div>
          <div className="app-stat"><div className="app-stat__value" style={{ color: '#e11d48' }}>{doneCount.validated}</div><div className="app-stat__label">Validated Today</div></div>
          <div className="app-stat"><div className="app-stat__value" style={{ color: '#ef4444' }}>{doneCount.rejected}</div><div className="app-stat__label">Rejected Today</div></div>
          <div className="app-stat"><div className="app-stat__value">{pending.length + doneCount.validated + doneCount.rejected}</div><div className="app-stat__label">Total Requests</div></div>
        </div>

        <div className="applications-list">
          {loading ? <div className="loading-text">Loading...</div>
          : pending.length === 0 ? (
            <div className="applications-empty">
              <CheckIcon />
              <h3 className="applications-empty__title">All caught up!</h3>
              <p className="applications-empty__text">No pending validations at this time.</p>
            </div>
          ) : pending.map(item => {
            const student = item.studentId || {};
            const offer   = item.offerId   || {};
            const company = offer.companyId || {};
            return (
              <div key={item._id} className="application-card">
                <div className="application-card__header">
                  <div className="application-card__company">
                    {/* Student avatar */}
                    <div className="application-card__logo admin-logo-bg">
                      {(student.firstName || 'S').charAt(0)}
                    </div>
                    <div className="application-card__info">
                      <h3 className="application-card__title">{student.firstName} {student.lastName}</h3>
                      <p className="application-card__company-name">{student.level} · {student.university || 'University'}</p>
                    </div>
                  </div>
                  <span className="application-card__status application-card__status--pending">Awaiting Validation</span>
                </div>

                {/* Company info with logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <CompanyLogo logo={company.logo} name={company.name} size={36} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#0f0f1a' }}>{company.name || 'Company'}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{offer.title || ''} · {offer.type || ''} · {offer.duration} months</div>
                  </div>
                </div>

                <div className="application-card__details">
                  <span className="application-card__detail">{company.wilaya || ''}</span>
                  <span className="application-card__detail">{offer.duration} months</span>
                </div>
                <div className="application-card__meta">
                  <span className="application-card__date">
                    Company accepted on {new Date(item.updatedAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="internship-card__skills" style={{ marginBottom: 16 }}>
                  {(offer.requiredSkills || []).map((sk, i) => <span key={i} className="internship-card__skill">{sk}</span>)}
                </div>
                <div className="application-card__actions">
                  <Btn variant="" style={{ padding: '9px 18px', fontSize: '13px' }} onClick={() => setViewItem(item)}>
                    View Details
                  </Btn>
                  <button className="btn--admin-validate" onClick={() => setActionConfirm({ item, type: 'validate' })}>
                    <CheckIcon /> Validate
                  </button>
                  <button className="btn--admin-reject" onClick={() => { setRejectModal(item); setRejectReason(''); }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* VIEW DETAILS MODAL */}
      {viewItem && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setViewItem(null); }}>
          <div className="modal-box modal-box--large">
            <div className="cv-modal__header">
              <div className="cv-modal__avatar admin-logo-bg">{(viewItem.studentId?.firstName || 'S').charAt(0)}</div>
              <div className="cv-modal__info">
                <div className="cv-modal__name">{viewItem.studentId?.firstName} {viewItem.studentId?.lastName}</div>
                <div className="cv-modal__level">{viewItem.studentId?.level} · {viewItem.studentId?.specialty}</div>
                <div className="cv-modal__university">{viewItem.studentId?.university || 'Université Abdelhamid Mehri — Constantine 2'}</div>
              </div>
              <span className="application-card__status application-card__status--pending cv-modal__status">Pending</span>
            </div>

            {/* Company with logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,.06)', marginBottom: 8 }}>
              <CompanyLogo logo={viewItem.offerId?.companyId?.logo} name={viewItem.offerId?.companyId?.name} size={44} />
              <div>
                <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14 }}>{viewItem.offerId?.companyId?.name || 'Company'}</div>
                <div style={{ color: '#64748b', fontSize: 12 }}>{viewItem.offerId?.companyId?.wilaya || ''}</div>
              </div>
            </div>

            {[
              ['Offer',     viewItem.offerId?.title    || 'N/A'],
              ['Type',      viewItem.offerId?.type     || 'N/A'],
              ['Duration',  `${viewItem.offerId?.duration || ''} months`],
              ['Phone',     viewItem.studentId?.phone  || 'N/A'],
            ].map(([label, value]) => (
              <div key={label} className="cv-modal__info-row">
                <span className="cv-modal__info-label">{label}</span>
                <span className="cv-modal__info-value">{value}</span>
              </div>
            ))}

            <div className="cv-modal__actions" style={{ marginTop: 24 }}>
              <button className="btn--cv-accept" style={{ background: '#e11d48' }}
                onClick={() => { setViewItem(null); setActionConfirm({ item: viewItem, type: 'validate' }); }}>
                <CheckIcon /> Validate Agreement
              </button>
              <button className="btn--cv-refuse"
                onClick={() => { setViewItem(null); setRejectModal(viewItem); setRejectReason(''); }}>
                Reject
              </button>
              <Btn variant="ghost" style={{ flex: 1 }} onClick={() => setViewItem(null)}>Close</Btn>
            </div>
          </div>
        </div>
      )}

      {/* VALIDATE CONFIRM */}
      {actionConfirm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-box__title">Confirm Validation</h3>
            <div className="confirm-modal__notice" style={{ borderColor: 'rgba(225,29,72,.3)', background: 'rgba(225,29,72,.08)' }}>
              <p className="confirm-modal__notice-text" style={{ color: '#e11d48' }}>
                This will generate an official PDF agreement and notify both the student and the company.
              </p>
            </div>
            <p className="modal-box__text">
              Validating <strong style={{ color: '#f1f5f9' }}>{actionConfirm.item.studentId?.firstName}'s</strong> placement at{' '}
              <strong style={{ color: '#f1f5f9' }}>{actionConfirm.item.offerId?.companyId?.name || 'company'}</strong>.
            </p>
            <div className="modal-box__actions">
              <Btn variant="outline" style={{ flex: 1 }} onClick={() => setActionConfirm(null)}>Cancel</Btn>
              <button className="btn--confirm-action btn--confirm-action--accepted" style={{ background: '#e11d48' }}
                onClick={() => handleValidate(actionConfirm.item._id)} disabled={actionLoading}>
                {actionLoading ? 'Processing...' : <><CheckIcon /> Validate</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setRejectModal(null); }}>
          <div className="modal-box">
            <h3 className="modal-box__title">Reject Application</h3>
            <p className="modal-box__text">
              Reason for rejecting <strong style={{ color: '#f1f5f9' }}>{rejectModal.studentId?.firstName}'s</strong> placement:
            </p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Reason *</label>
              <textarea className="input cv-textarea" rows={4}
                placeholder="e.g. Missing required documentation..."
                value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                style={{ background: 'rgba(255,255,255,.05)', borderColor: 'rgba(255,255,255,.1)', color: '#f1f5f9' }} />
            </div>
            <div className="modal-box__actions">
              <Btn variant="outline" style={{ flex: 1 }} onClick={() => setRejectModal(null)}>Cancel</Btn>
              <button className="btn--confirm-delete" onClick={() => handleReject(rejectModal._id)}
                disabled={!rejectReason.trim() || actionLoading}
                style={{ opacity: rejectReason.trim() ? 1 : 0.5 }}>
                {actionLoading ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}