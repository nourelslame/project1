// src/pages/AdminDocuments.jsx
// Admin documents page — lists all validated internship agreements.
// Admin can preview agreement data and download the PDF.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Btn from '../components/Btn';
import NotificationBell from '../components/NotificationBell';
import { DocIcon, ChartIcon, UsersIcon, CheckIcon } from '../components/Icons';
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

const adminNavItems = [
  { id: 'dashboard',  label: 'Dashboard',        icon: <ChartIcon /> },
  { id: 'pending',    label: 'Pending Requests',  icon: <DocIcon /> },
  { id: 'documents',  label: 'Documents',         icon: <DocIcon /> },
  { id: 'users',      label: 'Manage Users',      icon: <UsersIcon /> },
  { id: 'skills',     label: 'Skills & Wilayas',  icon: <ChartIcon /> },
];

export default function AdminDocuments() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [preview, setPreview]       = useState(null);       // agreement object shown in modal
  const [downloading, setDownloading] = useState(null);     // agreement._id being downloaded

  // ── Load all validated agreements from backend ──
  useEffect(() => {
    const fetchAgreements = async () => {
      try {
        // GET /api/admin/validated — returns InternshipAgreement docs
        const res = await api.get('/admin/validated');
        setAgreements(res.data.data || []);
      } catch (err) {
        console.error('Failed to load agreements:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAgreements();
  }, []);

  // ── Preview: load full agreement data via /api/documents/agreement/:appId ──
  const handlePreview = async (appId) => {
    try {
      const res = await api.get(`/documents/agreement/${appId}`);
      setPreview(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Preview not available. The agreement may not exist yet.');
    }
  };

  // ── Download: fetch as blob so the Authorization header is sent ──
  // window.open() cannot send headers — this approach works for protected routes.
  const handleDownload = async (appId, studentName) => {
    setDownloading(appId);
    try {
      const res = await api.get(
        `/documents/download/${appId}`,
        { responseType: 'blob' }
      );
      // Create a temporary link and trigger download
      const url  = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `agreement-${studentName || appId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to download PDF. The file may not exist on the server.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="dashboard">

      {/* ── SIDEBAR ── */}
      <aside className="sidebar sidebar--admin">
        <div className="sidebar__logo"><Logo /></div>
        <nav className="sidebar__nav">
          {adminNavItems.map(item => (
            <button key={item.id}
              className={`sidebar__nav-item ${item.id === 'documents' ? 'sidebar__nav-item--active-admin' : ''}`}
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
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">Admin</div>
            <div className="sidebar__user-role">University Admin</div>
          </div>
          <button className="sidebar__logout" onClick={() => { logout(); navigate('/'); }} title="Logout">
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
            <p className="dashboard-header__greeting admin-greeting">Official Records ✦</p>
            <h1 className="dashboard-header__title">Internship Agreements</h1>
          </div>
          <div className="dashboard-header__actions">
            <NotificationBell />
          </div>
        </div>

        {/* Stats */}
        <div className="applications-stats" style={{ marginBottom: 28 }}>
          <div className="app-stat">
            <div className="app-stat__value">{agreements.length}</div>
            <div className="app-stat__label">Total Agreements</div>
          </div>
          <div className="app-stat">
            <div className="app-stat__value" style={{ color: '#e11d48' }}>
              {agreements.filter(a => a.pdfPath).length}
            </div>
            <div className="app-stat__label">PDFs Available</div>
          </div>
          <div className="app-stat">
            <div className="app-stat__value" style={{ color: '#f59e0b' }}>
              {agreements.filter(a => !a.pdfPath).length}
            </div>
            <div className="app-stat__label">Pending PDF</div>
          </div>
        </div>

        <h2 style={{ fontWeight: 700, color: '#0f0f1a', marginBottom: 16, fontSize: 16 }}>
          Validated Internship Agreements
        </h2>

        {/* Agreements list */}
        <div className="applications-list">
          {loading ? (
            <div className="loading-text">Loading agreements...</div>
          ) : agreements.length === 0 ? (
            <div className="applications-empty">
              <h3 className="applications-empty__title">No agreements yet</h3>
              <p className="applications-empty__text">
                Agreements appear here after you validate a pending request.
              </p>
              <Btn variant="admin-primary" onClick={() => navigate('/admin/pending')}>
                Go to Pending Requests
              </Btn>
            </div>
          ) : agreements.map(agr => {
            const student = agr.studentId    || {};
            const company = agr.companyId    || {};
            const appId   = agr.applicationId?._id || agr.applicationId;
            const offerTitle = agr.applicationId?.offerId?.title || '';
            const studentName = `${student.firstName || ''}-${student.lastName || ''}`.trim();

            return (
              <div key={agr._id} className="application-card">
                {/* Header */}
                <div className="application-card__header">
                  <div className="application-card__company">
                    <div className="application-card__logo admin-logo-bg">
                      {(student.firstName || 'S').charAt(0)}
                    </div>
                    <div className="application-card__info">
                      <h3 className="application-card__title">
                        {student.firstName} {student.lastName}
                      </h3>
                      <p className="application-card__company-name">
                        {student.level || ''} · {agr.universityName || 'University'}
                      </p>
                    </div>
                  </div>
                  <span
                    className="application-card__status"
                    style={{ background: 'rgba(16,185,129,.12)', color: '#10b981', border: '1px solid rgba(16,185,129,.2)' }}>
                    Validated ✓
                  </span>
                </div>

                {/* Details */}
                <div className="application-card__details">
                  <span className="application-card__detail">{company.name || 'Company'}</span>
                  {offerTitle && <span className="application-card__detail">{offerTitle}</span>}
                  <span className="application-card__detail">
                    {agr.startDate ? new Date(agr.startDate).toLocaleDateString() : ''} →{' '}
                    {agr.endDate   ? new Date(agr.endDate).toLocaleDateString()   : ''}
                  </span>
                </div>

                <div className="application-card__meta">
                  <span className="application-card__date">
                    Supervisor: {agr.supervisorName || 'N/A'} · Generated: {new Date(agr.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* ── Action buttons ── */}
                <div className="application-card__actions">

                  {/* Preview button — only if we have an applicationId */}
                  {appId && (
                    <Btn
                      variant=""
                      style={{ padding: '9px 18px', fontSize: '13px' }}
                      onClick={() => handlePreview(appId)}
                    >
                      <EyeIcon /> Preview
                    </Btn>
                  )}

                  {/* Download button — only if PDF was generated */}
                  {agr.pdfPath && appId ? (
                    <button
                      className="btn--admin-validate"
                      onClick={() => handleDownload(appId, studentName)}
                      disabled={downloading === appId}
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <DownloadIcon />
                      {downloading === appId ? 'Downloading...' : 'Download PDF'}
                    </button>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: 13, padding: '9px 0' }}>
                      ⏳ PDF not yet generated
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ── PREVIEW MODAL ── */}
      {preview && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setPreview(null); }}>
          <div className="modal-box modal-box--large">

            {/* Modal header */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(225,29,72,.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px', color: '#e11d48',
              }}>
                <DocIcon />
              </div>
              <h3 style={{ color: '#f1f5f9', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                Convention de Stage
              </h3>
              <p style={{ color: '#64748b', fontSize: 13 }}>Agreement Preview</p>
            </div>

            {/* Document preview */}
            <div className="doc-preview">
              <div className="doc-preview__header">
                <div className="doc-preview__uni">UNIVERSITÉ SÉTIF 1 — FERHAT ABBAS</div>
                <div className="doc-preview__title">CONVENTION DE STAGE</div>
              </div>
              <div className="doc-preview__body">
                {[
                  ['Student',      `${preview.studentId?.firstName || ''} ${preview.studentId?.lastName || ''}`.trim()],
                  ['Level',        `${preview.studentId?.level || ''} — ${preview.studentId?.specialty || ''}`],
                  ['University',   preview.universityName || ''],
                  ['Host Company', preview.companyId?.name || ''],
                  ['Supervisor',   preview.supervisorName || ''],
                  ['Start Date',   preview.startDate ? new Date(preview.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''],
                  ['End Date',     preview.endDate   ? new Date(preview.endDate).toLocaleDateString('en-GB',   { day: 'numeric', month: 'long', year: 'numeric' }) : ''],
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

            {/* Modal actions */}
            <div className="modal-box__actions" style={{ marginTop: 24 }}>
              <Btn variant="outline" style={{ flex: 1 }} onClick={() => setPreview(null)}>
                Close
              </Btn>
              {preview.pdfPath && (
                <button
                  className="btn--admin-validate"
                  style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  onClick={() => {
                    const appId = preview.applicationId?._id || preview.applicationId;
                    if (appId) handleDownload(appId, `${preview.studentId?.firstName}-${preview.studentId?.lastName}`);
                    setPreview(null);
                  }}
                >
                  <DownloadIcon /> Download PDF
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}