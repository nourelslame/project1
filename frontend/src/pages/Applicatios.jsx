// src/pages/Applicatios.jsx
// My Applications — shows company logo on each application card.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Btn from '../components/Btn';
import CompanyLogo from '../components/CompanyLogo';
import { SearchIcon, DocIcon, ChartIcon, GradCapIcon, BuildingIcon } from '../components/Icons';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const DownloadIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const statusConfig = {
  PENDING:   { label: 'Pending',   css: 'pending'  },
  ACCEPTED:  { label: 'Accepted',  css: 'accepted' },
  REFUSED:   { label: 'Refused',   css: 'rejected' },
  VALIDATED: { label: 'Validated', css: 'accepted' },
};

function ApplicationCard({ application, onCancel, onDownload }) {
  const s       = statusConfig[application.status] || statusConfig.PENDING;
  const offer   = application.offerId   || {};
  const company = offer.companyId || {};

  return (
    <div className="application-card">
      <div className="application-card__header">
        <div className="application-card__company">
          {/* ── Real company logo ── */}
          <CompanyLogo logo={company.logo} name={company.name} size={52} />

          <div className="application-card__info">
            <h3 className="application-card__title">{offer.title || 'Unknown Offer'}</h3>
            <p className="application-card__company-name">
              <BuildingIcon /> {company.name || 'Company'}
            </p>
          </div>
        </div>
        <span className={`application-card__status application-card__status--${s.css}`}>
          {s.label}
        </span>
      </div>

      <div className="application-card__details">
        <span className="application-card__detail"> <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>{offer.wilaya || ''}</span>
        <span className="application-card__detail" ><svg   width="12px" height="12px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M6 5V4C6 2.34315 7.34315 1 9 1H15C16.6569 1 18 2.34315 18 4V5H20C21.6569 5 23 6.34315 23 8V20C23 21.6569 21.6569 23 20 23H4C2.34315 23 1 21.6569 1 20V8C1 6.34315 2.34315 5 4 5H6ZM8 4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V5H8V4ZM19.882 7H4.11803L6.34164 11.4472C6.51103 11.786 6.8573 12 7.23607 12H11C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12H16.7639C17.1427 12 17.489 11.786 17.6584 11.4472L19.882 7ZM11 14H7.23607C6.09975 14 5.06096 13.358 4.55279 12.3416L3 9.23607V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V9.23607L19.4472 12.3416C18.939 13.358 17.9002 14 16.7639 14H13C13 14.5523 12.5523 15 12 15C11.4477 15 11 14.5523 11 14Z" fill="#0F0F0F"/>
</svg>{offer.type   || ''}</span>
        <span className="application-card__detail"> <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
          {offer.duration ? `${offer.duration} months` : ''}
        </span>
      </div>

      {(offer.requiredSkills || []).length > 0 && (
        <div className="internship-card__skills" style={{ marginBottom: 12 }}>
          {(offer.requiredSkills || []).slice(0, 4).map((sk, i) => (
            <span key={i} className="internship-card__skill">{sk}</span>
          ))}
        </div>
      )}

      <div className="application-card__meta">
        <span className="application-card__date">
          Applied on {new Date(application.createdAt).toLocaleDateString('fr-FR')}
        </span>
      </div>

      <div className="application-card__actions">
        {application.status === 'PENDING' && (
          <button className="application-card__cancel" onClick={() => onCancel(application._id)}>
            Cancel Application
          </button>
        )}

        {application.status === 'VALIDATED' && (
          <div className="agreement-actions">
            {application.hasPdf ? (
              <>
                <button className="btn--agreement-download" onClick={() => onDownload(application.agreementId, 'download')}>
                  <DownloadIcon /> Download Agreement (PDF)
                </button>
                <button className="btn--agreement-preview" onClick={() => onDownload(application.agreementId, 'preview')}>
                  <EyeIcon /> View Agreement
                </button>
              </>
            ) : (
              <span className="agreement-pending-text">⏳ Agreement PDF is being generated…</span>
            )}
          </div>
        )}

        {application.status === 'ACCEPTED' && (
          <span className="agreement-pending-text">
            ✅ Accepted by company — waiting for university validation
          </span>
        )}
      </div>
    </div>
  );
}

function AgreementModal({ agreement, onClose }) {
  if (!agreement) return null;
  const student = agreement.studentId || {};
  const company = agreement.companyId || {};
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box modal-box--large">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(124,58,237,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#7c3aed' }}>
            <DocIcon />
          </div>
          <h3 style={{ color: '#de0c0c', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Intership Agreement</h3>
          <p style={{ color: '#8b6464', fontSize: 13 }}>Your validated internship agreement</p>
        </div>
        <div className="doc-preview">
          <div className="doc-preview__header">
            <div className="doc-preview__uni">UNIVERSITÉ ABDELHAMID MEHRI — CONSTANTINE 2</div>
            <div className="doc-preview__title">Intership Agreement</div>
          </div>
          <div className="doc-preview__body">
            {[
              ['Student',      `${student.firstName || ''} ${student.lastName || ''}`.trim()],
              ['Level',        `${student.level || ''} — ${student.specialty || ''}`],
              ['University',   agreement.universityName || 'Université Abdelhamid Mehri — Constantine 2'],
              ['Host Company', company.name || ''],
              ['Supervisor',   agreement.supervisorName || ''],
              ['Start Date',   agreement.startDate ? new Date(agreement.startDate).toLocaleDateString('fr-FR') : ''],
              ['End Date',     agreement.endDate   ? new Date(agreement.endDate).toLocaleDateString('fr-FR')   : ''],
              ['Generated',    agreement.createdAt ? new Date(agreement.createdAt).toLocaleDateString('fr-FR') : ''],
            ].map(([label, value]) => (
              <div key={label} className="doc-preview__row">
                <span className="doc-preview__label">{label}</span>
                <span className="doc-preview__value">{value}</span>
              </div>
            ))}
          </div>
          <div className="doc-preview__sigs">
            <div className="doc-preview__sig"><div className="doc-preview__sig-line" /><div className="doc-preview__sig-label">Student Signature</div></div>
            <div className="doc-preview__sig"><div className="doc-preview__sig-line" /><div className="doc-preview__sig-label">Company Stamp</div></div>
            <div className="doc-preview__sig"><div className="doc-preview__sig-line" /><div className="doc-preview__sig-label">University Seal</div></div>
          </div>
        </div>
        <div className="modal-box__actions" style={{ marginTop: 20 }}>
          <Btn variant="ghost" style={{ flex: 1 }} onClick={onClose}>Close</Btn>
        </div>
      </div>
    </div>
  );
}

export default function MyApplications() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [filter, setFilter]               = useState('all');
  const [applications, setApplications]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [previewAgreement, setPreviewAgreement] = useState(null);
  const [previewLoading, setPreviewLoading]     = useState(false);

  useEffect(() => {
    api.get('/student/applications')
      .then(res => setApplications(res.data.data || []))
      .catch(err => console.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this application?')) return;
    try {
      await api.delete(`/applications/${id}`);
      setApplications(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel.');
    }
  };

  const handleAgreement = async (agreementId, mode) => {
    if (!agreementId) { alert('Agreement ID not found.'); return; }
    if (mode === 'download') {
      try {
        const res = await api.get(`/student/agreements/${agreementId}/download`, { responseType: 'blob' });
        const url  = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'convention-de-stage.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to download PDF.');
      }
    } else {
      setPreviewLoading(true);
      try {
        const res   = await api.get('/student/agreements');
        const found = (res.data.data || []).find(a => a._id === agreementId);
        if (found) setPreviewAgreement(found);
        else alert('Agreement not found.');
      } catch (err) {
        alert('Failed to load agreement.');
      } finally { setPreviewLoading(false); }
    }
  };

  const filtered = applications.filter(a => {
    if (filter === 'all')      return true;
    if (filter === 'pending')  return a.status === 'PENDING';
    if (filter === 'accepted') return a.status === 'ACCEPTED' || a.status === 'VALIDATED';
    if (filter === 'refused')  return a.status === 'REFUSED';
    return true;
  });

  const stats = {
    total:    applications.length,
    pending:  applications.filter(a => a.status === 'PENDING').length,
    accepted: applications.filter(a => a.status === 'ACCEPTED' || a.status === 'VALIDATED').length,
    refused:  applications.filter(a => a.status === 'REFUSED').length,
  };

  const navItems = [
    { id: 'dashboard',    label: 'Dashboard',         icon: <ChartIcon /> },
    { id: 'cv',           label: 'My CV',              icon: <GradCapIcon /> },
    { id: 'search',       label: 'Search Internships', icon: <SearchIcon /> },
    { id: 'applications', label: 'My Applications',    icon: <DocIcon /> },
  ];

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar__logo"><Logo /></div>
        <nav className="sidebar__nav">
          {navItems.map(item => (
            <button key={item.id}
              className={`sidebar__nav-item ${item.id === 'applications' ? 'sidebar__nav-item--active' : ''}`}
              onClick={() => {
                if (item.id === 'dashboard') navigate('/student/dashboard');
                if (item.id === 'cv')        navigate('/student/cv');
                if (item.id === 'search')    navigate('/search');
              }}>
              <span className="sidebar__nav-icon">{item.icon}</span>
              <span className="sidebar__nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar__user">
          <div className="sidebar__avatar">S</div>
          <div className="sidebar__user-info"><div className="sidebar__user-name">Student</div></div>
          <button className="sidebar__logout" onClick={() => { logout(); navigate('/'); }} title="Logout">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="applications-header">
          <div>
            <h1 className="applications-header__title">My Applications</h1>
            <p className="applications-header__subtitle">Track your applications and download your agreements</p>
          </div>
        </header>

        <div className="applications-stats">
          <div className="app-stat"><div className="app-stat__value">{stats.total}</div><div className="app-stat__label">Total</div></div>
          <div className="app-stat app-stat--orange"><div className="app-stat__value">{stats.pending}</div><div className="app-stat__label">Pending</div></div>
          <div className="app-stat app-stat--green"><div className="app-stat__value">{stats.accepted}</div><div className="app-stat__label">Accepted</div></div>
          <div className="app-stat app-stat--red"><div className="app-stat__value">{stats.refused}</div><div className="app-stat__label">Refused</div></div>
        </div>

        <div className="applications-filters">
          {[['all',`All (${stats.total})`],['pending',`Pending (${stats.pending})`],['accepted',`Accepted (${stats.accepted})`],['refused',`Refused (${stats.refused})`]].map(([key, label]) => (
            <button key={key} className={`app-filter ${filter === key ? 'app-filter--active' : ''}`} onClick={() => setFilter(key)}>
              {label}
            </button>
          ))}
        </div>

        <div className="applications-list">
          {loading || previewLoading ? (
            <div className="loading-text">Loading...</div>
          ) : filtered.length > 0 ? (
            filtered.map(app => (
              <ApplicationCard key={app._id} application={app} onCancel={handleCancel} onDownload={handleAgreement} />
            ))
          ) : (
            <div className="applications-empty">
              <GradCapIcon />
              <h3 className="applications-empty__title">No applications found</h3>
              <p className="applications-empty__text">
                {filter === 'all' ? "You haven't applied to any internships yet." : `No ${filter} applications.`}
              </p>
              {filter === 'all' && <Btn variant="primary" onClick={() => navigate('/search')}>Browse Internships</Btn>}
            </div>
          )}
        </div>
      </main>

      {previewAgreement && <AgreementModal agreement={previewAgreement} onClose={() => setPreviewAgreement(null)} />}
    </div>
  );
}
