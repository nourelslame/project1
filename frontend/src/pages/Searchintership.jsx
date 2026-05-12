// src/pages/Searchintership.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Btn from '../components/Btn';
import CompanyLogo from '../components/CompanyLogo';
import { SearchIcon, DocIcon, ChartIcon, GradCapIcon, BuildingIcon, ArrowRight } from '../components/Icons';
import api from '../api/axios';
import { useCatalog } from '../hooks/useCatalog';
import { useAuth } from '../context/AuthContext';

function FilterChip({ label, active, onClick }) {
  return <button className={`filter-chip ${active ? 'filter-chip--active' : ''}`} onClick={onClick}>{label}</button>;
}

function WilayaSelector({ wilayas, selectedWilaya, onSelect }) {
  const [expanded, setExpanded] = useState(false);
  const VISIBLE_COUNT = 6;
  const visibleWilayas = expanded ? wilayas : wilayas.slice(0, VISIBLE_COUNT);
  const hiddenCount = wilayas.length - VISIBLE_COUNT;

  return (
    <div className="wilaya-selector">
      <div className={`wilaya-selector__chips ${expanded ? 'wilaya-selector__chips--expanded' : ''}`}>
        <FilterChip label="All" active={selectedWilaya === 'all'} onClick={() => onSelect('all')} />
        {visibleWilayas.map(w => (
          <FilterChip key={w} label={w} active={selectedWilaya === w} onClick={() => onSelect(w)} />
        ))}
        {wilayas.length > VISIBLE_COUNT && (
          <button className={`wilaya-toggle-btn ${expanded ? 'wilaya-toggle-btn--open' : ''}`} onClick={() => setExpanded(v => !v)}>
            {expanded ? (
              <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6"/></svg>Show less</>
            ) : (
              <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>+{hiddenCount} wilayas</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Slide-in Details Panel ───────────────────────────────────────────────────
function DetailsPanel({ internship, onClose, onApply, applied }) {
  const company = internship.companyId || {};

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <>
      {/* Dimmed backdrop */}
      <div className="details-backdrop" onClick={onClose} />

      {/* Panel slides in from the right */}
      <div className="details-panel">

        {/* Top bar */}
        <div className="details-panel__topbar">
          <button className="details-panel__back" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back
          </button>
          <span className={`internship-card__type internship-card__type--${internship.type?.toLowerCase()}`}>
            {internship.type}
          </span>
        </div>

        {/* Scrollable body */}
        <div className="details-panel__body">

          {/* Company + title hero */}
          <div className="details-panel__hero">
            <CompanyLogo logo={company.logo} name={company.name} size={60} />
            <div>
              <h2 className="details-panel__title">{internship.title}</h2>
              <p className="details-panel__company">
                <BuildingIcon /> {company.name || 'Company'}
              </p>
            </div>
          </div>

          {/* Meta pills */}
          <div className="details-panel__meta">
            <div className="details-panel__meta-pill">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {internship.wilaya}
            </div>
            <div className="details-panel__meta-pill">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
              {internship.duration} months
            </div>
            <div className="details-panel__meta-pill">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Deadline: {new Date(internship.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          </div>

          <div className="details-panel__divider" />

          {/* Description */}
          <div className="details-panel__section">
            <h4 className="details-panel__section-title">About this Internship</h4>
            <p className="details-panel__description">{internship.description}</p>
          </div>

          {/* Required Skills */}
          {(internship.requiredSkills || []).length > 0 && (
            <div className="details-panel__section">
              <h4 className="details-panel__section-title">Required Skills</h4>
              <div className="internship-card__skills">
                {internship.requiredSkills.map((skill, i) => (
                  <span key={i} className="internship-card__skill">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Company description if available */}
          {company.description && (
            <div className="details-panel__section">
              <h4 className="details-panel__section-title">About {company.name}</h4>
              <p className="details-panel__description">{company.description}</p>
            </div>
          )}
        </div>

        {/* Sticky Apply button at the bottom */}
        <div className="details-panel__footer">
          <Btn
            variant={applied ? '' : 'primary'}
            onClick={() => { if (!applied) { onApply(internship._id); onClose(); } }}
            style={{ opacity: applied ? 0.7 : 1, width: '100%', justifyContent: 'center' }}
          >
            {applied ? 'Applied ✓' : 'Apply Now'}
          </Btn>
        </div>
      </div>
    </>
  );
}

// ── Internship Card ──────────────────────────────────────────────────────────
function InternshipCard({ internship, onApply, applied, onViewDetails }) {
  const company = internship.companyId || {};
  return (
    <div className="internship-card">
      <div className="internship-card__header">
        <CompanyLogo logo={company.logo} name={company.name} size={52} />
        <div className="internship-card__header-info">
          <h3 className="internship-card__title">{internship.title}</h3>
          <p className="internship-card__company"><BuildingIcon />{company.name || 'Company'}</p>
        </div>
        <span className={`internship-card__type internship-card__type--${internship.type?.toLowerCase()}`}>
          {internship.type}
        </span>
      </div>

      <p className="internship-card__description">{internship.description}</p>

      <div className="internship-card__skills">
        {(internship.requiredSkills || []).map((skill, i) => (
          <span key={i} className="internship-card__skill">{skill}</span>
        ))}
      </div>

      <div className="internship-card__footer">
        <span className="internship-card__location">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path opacity="0.5" d="M12 2C8.13401 2 5 5.13401 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13401 15.866 2 12 2Z" fill="#1C274C"/>
  <path d="M12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11Z" fill="#1C274C"/>
</svg> {internship.wilaya}
        </span>
        <span className="internship-card__duration">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6.94028 2C7.35614 2 7.69326 2.32421 7.69326 2.72414V4.18487C8.36117 4.17241 9.10983 4.17241 9.95219 4.17241H13.9681C14.8104 4.17241 15.5591 4.17241 16.227 4.18487V2.72414C16.227 2.32421 16.5641 2 16.98 2C17.3958 2 17.733 2.32421 17.733 2.72414V4.24894C19.178 4.36022 20.1267 4.63333 20.8236 5.30359C21.5206 5.97385 21.8046 6.88616 21.9203 8.27586L22 9H2.92456H2V8.27586C2.11571 6.88616 2.3997 5.97385 3.09665 5.30359C3.79361 4.63333 4.74226 4.36022 6.1873 4.24894V2.72414C6.1873 2.32421 6.52442 2 6.94028 2Z" fill="#1C274C"/>
  <path opacity="0.5" d="M21.9995 14.0001V12.0001C21.9995 11.161 21.9963 9.66527 21.9834 9H2.00917C1.99626 9.66527 1.99953 11.161 1.99953 12.0001V14.0001C1.99953 17.7713 1.99953 19.6569 3.1711 20.8285C4.34267 22.0001 6.22829 22.0001 9.99953 22.0001H13.9995C17.7708 22.0001 19.6564 22.0001 20.828 20.8285C21.9995 19.6569 21.9995 17.7713 21.9995 14.0001Z" fill="#1C274C"/>
  <path d="M18 17C18 17.5523 17.5523 18 17 18C16.4477 18 16 17.5523 16 17C16 16.4477 16.4477 16 17 16C17.5523 16 18 16.4477 18 17Z" fill="#1C274C"/>
  <path d="M18 13C18 13.5523 17.5523 14 17 14C16.4477 14 16 13.5523 16 13C16 12.4477 16.4477 12 17 12C17.5523 12 18 12.4477 18 13Z" fill="#1C274C"/>
  <path d="M13 17C13 17.5523 12.5523 18 12 18C11.4477 18 11 17.5523 11 17C11 16.4477 11.4477 16 12 16C12.5523 16 13 16.4477 13 17Z" fill="#1C274C"/>
  <path d="M13 13C13 13.5523 12.5523 14 12 14C11.4477 14 11 13.5523 11 13C11 12.4477 11.4477 12 12 12C12.5523 12 13 12.4477 13 13Z" fill="#1C274C"/>
  <path d="M8 17C8 17.5523 7.55228 18 7 18C6.44772 18 6 17.5523 6 17C6 16.4477 6.44772 16 7 16C7.55228 16 8 16.4477 8 17Z" fill="#1C274C"/>
  <path d="M8 13C8 13.5523 7.55228 14 7 14C6.44772 14 6 13.5523 6 13C6 12.4477 6.44772 12 7 12C7.55228 12 8 12.4477 8 13Z" fill="#1C274C"/>
</svg> {internship.duration} months</span>
        <span className="internship-card__deadline">        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12.7915 2H11.2089C9.67059 2 8.90146 2 8.35306 2.43992C7.80465 2.87983 7.6378 3.63065 7.30411 5.13228L7.23936 5.42365C8.21852 5 9.59408 5 12.0001 5C14.4062 5 15.7818 5 16.761 5.42373L16.6962 5.13228C16.3625 3.63065 16.1957 2.87983 15.6473 2.43992C15.0989 2 14.3297 2 12.7915 2Z" fill="#1C274C"/>
  <path d="M7.23926 18.5763C8.21842 19 9.594 19 12.0001 19C14.4062 19 15.7817 19 16.7609 18.5763L16.6961 18.8677C16.3624 20.3693 16.1956 21.1202 15.6472 21.5601C15.0988 22 14.3297 22 12.7914 22H11.2088C9.6705 22 8.90137 22 8.35297 21.5601C7.80456 21.1202 7.63771 20.3693 7.30401 18.8677L7.23926 18.5763Z" fill="#1C274C"/>
  <path opacity="0.5" d="M6.77772 18.3259C7.78661 19 9.19108 19 12 19C14.8089 19 16.2134 19 17.2223 18.3259C17.659 18.034 18.034 17.659 18.3259 17.2223C19 16.2134 19 14.8089 19 12C19 9.19108 19 7.78661 18.3259 6.77772C18.034 6.34096 17.659 5.96596 17.2223 5.67412C16.2134 5 14.8089 5 12 5C9.19108 5 7.78661 5 6.77772 5.67412C6.34096 5.96596 5.96596 6.34096 5.67412 6.77772C5 7.78661 5 9.19108 5 12C5 14.8089 5 16.2134 5.67412 17.2223C5.96596 17.659 6.34096 18.034 6.77772 18.3259Z" fill="#1C274C"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M12 8.25C12.4142 8.25 12.75 8.58579 12.75 9V11.7576L14.5198 13.4594C14.8184 13.7465 14.8277 14.2213 14.5406 14.5198C14.2535 14.8184 13.7787 14.8277 13.4802 14.5406L11.4802 12.6175C11.3331 12.4761 11.25 12.2809 11.25 12.0769V9C11.25 8.58579 11.5858 8.25 12 8.25Z" fill="#1C274C"/>
</svg>
          Deadline: {new Date(internship.deadline).toLocaleDateString()}
        </span>
      </div>

      <div className="hhh" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <Btn variant="" onClick={() => onViewDetails(internship)}>
          View Details
        </Btn>
        <Btn
          variant={applied ? '' : 'primary'}
          onClick={() => !applied && onApply(internship._id)}
          style={{ opacity: applied ? 0.7 : 1 }}
        >
          {applied ? 'Applied ✓' : 'Apply Now'}
        </Btn>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function SearchInternships() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { skills: catalogSkills, wilayas: catalogWilayas, loading: catalogLoading } = useCatalog();

  const [internships, setInternships]               = useState([]);
  const [loading, setLoading]                       = useState(true);
  const [appliedIds, setAppliedIds]                 = useState(new Set());
  const [searchQuery, setSearchQuery]               = useState('');
  const [selectedWilaya, setSelectedWilaya]         = useState('all');
  const [selectedType, setSelectedType]             = useState('all');
  const [selectedSkills, setSelectedSkills]         = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);

  const types = ['All', 'TECHNICAL', 'RESEARCH', 'COMMERCIAL', 'OTHER'];

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedWilaya !== 'all') params.set('wilaya', selectedWilaya);
      if (selectedType   !== 'all') params.set('type',   selectedType);
      if (searchQuery)              params.set('keyword', searchQuery);
      if (selectedSkills.length)    params.set('skills',  selectedSkills.join(','));
      const res = await api.get(`/student/offers?${params.toString()}`);
      setInternships(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch offers:', err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedWilaya, selectedType, searchQuery, selectedSkills]);

  useEffect(() => { fetchOffers(); }, [fetchOffers]);

  const handleApply = async (offerId) => {
    try {
      await api.post(`/applications/${offerId}`);
      setAppliedIds(prev => new Set([...prev, offerId]));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply.');
    }
  };

  const handleSkillToggle = (skill) =>
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);

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
              className={`sidebar__nav-item ${item.id === 'search' ? 'sidebar__nav-item--active' : ''}`}
              onClick={() => {
                if (item.id === 'dashboard')    navigate('/student/dashboard');
                if (item.id === 'cv')           navigate('/student/cv');
                if (item.id === 'applications') navigate('/applications');
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
        <div className="dashboard-header">
          <div>
            <p className="dashboard-header__greeting">Find Your Opportunity ✦</p>
            <h1 className="dashboard-header__title">Search Internships</h1>
          </div>
          <div className="dashboard-header__actions">
            <Btn variant="primary" style={{ padding: '10px 20px', fontSize: '14px' }} onClick={() => navigate('/student/cv')}>
              Update CV <ArrowRight />
            </Btn>
          </div>
        </div>

        <div className="search-bar-section">
          <div className="search-bar">
            <SearchIcon />
            <input type="text" className="search-bar__input"
              placeholder="Search by title, company, or keyword..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div className="search-filters">
          <div className="search-filter-group">
            <h3 className="search-filter-group__title">Location</h3>
            <WilayaSelector wilayas={catalogWilayas} selectedWilaya={selectedWilaya} onSelect={setSelectedWilaya} />
          </div>
          <div className="search-filter-group">
            <h3 className="search-filter-group__title">Type</h3>
            <div className="search-filter-chips">
              {types.map(t => (
                <FilterChip key={t} label={t === 'All' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
                  active={selectedType === (t === 'All' ? 'all' : t)}
                  onClick={() => setSelectedType(t === 'All' ? 'all' : t)} />
              ))}
            </div>
          </div>
          <div className="search-filter-group">
            <h3 className="search-filter-group__title">Skills</h3>
            <div className="search-filter-chips">
              {catalogSkills.map(skill => (
                <FilterChip key={skill} label={skill} active={selectedSkills.includes(skill)}
                  onClick={() => handleSkillToggle(skill)} />
              ))}
            </div>
          </div>
        </div>

        <div className="search-results-header">
          <p className="search-results-count">
            {loading ? 'Loading...' : `${internships.length} internship${internships.length !== 1 ? 's' : ''} available`}
          </p>
        </div>

        <div className="search-results">
          {loading || catalogLoading ? (
            <div className="loading-text">Loading...</div>
          ) : internships.length > 0 ? (
            internships.map(offer => (
              <InternshipCard
                key={offer._id}
                internship={offer}
                onApply={handleApply}
                applied={appliedIds.has(offer._id)}
                onViewDetails={setSelectedInternship}
              />
            ))
          ) : (
            <div className="search-empty">
              <SearchIcon />
              <h3 className="search-empty__title">No internships found</h3>
              <p className="search-empty__text">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </main>

      {/* ── Details Panel ── */}
      {selectedInternship && (
        <DetailsPanel
          internship={selectedInternship}
          onClose={() => setSelectedInternship(null)}
          onApply={handleApply}
          applied={appliedIds.has(selectedInternship._id)}
        />
      )}
    </div>
  );
}