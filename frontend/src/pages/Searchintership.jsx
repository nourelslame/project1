// src/pages/Searchintership.jsx
// Search Internships — filters use real skills/wilayas from the catalog API.
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Btn from '../components/Btn';
import { SearchIcon, DocIcon, ChartIcon, GradCapIcon, BuildingIcon, ArrowRight } from '../components/Icons';
import api from '../api/axios';
import { useCatalog } from '../hooks/useCatalog';
import { useAuth } from '../context/AuthContext';

function FilterChip({ label, active, onClick }) {
  return <button className={`filter-chip ${active ? 'filter-chip--active' : ''}`} onClick={onClick}>{label}</button>;
}

function InternshipCard({ internship, onApply, applied }) {
  return (
    <div className="internship-card">
      <div className="internship-card__header">
        <div className="internship-card__company-logo">
          {(internship.companyId?.name || 'C').charAt(0)}
        </div>
        <div className="internship-card__header-info">
          <h3 className="internship-card__title">{internship.title}</h3>
          <p className="internship-card__company"><BuildingIcon />{internship.companyId?.name || 'Company'}</p>
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
        <span className="internship-card__location">{internship.wilaya}</span>
        <span className="internship-card__duration">{internship.duration} months</span>
        <span className="internship-card__deadline">Deadline: {new Date(internship.deadline).toLocaleDateString()}</span>
      </div>
      <div className="hhh">
        <Btn variant={applied ? 'outline' : 'primary'} onClick={() => !applied && onApply(internship._id)}
          style={{ opacity: applied ? 0.7 : 1 }}>
          {applied ? 'Applied ✓' : 'Apply Now'}
        </Btn>
      </div>
    </div>
  );
}

export default function SearchInternships() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // ── Real catalog from backend ──
  const { skills: catalogSkills, wilayas: catalogWilayas, loading: catalogLoading } = useCatalog();

  const [internships, setInternships]       = useState([]);
  const [loading, setLoading]               = useState(true);
  const [appliedIds, setAppliedIds]         = useState(new Set());
  const [searchQuery, setSearchQuery]       = useState('');
  const [selectedWilaya, setSelectedWilaya] = useState('all');
  const [selectedType, setSelectedType]     = useState('all');
  const [selectedSkills, setSelectedSkills] = useState([]);

  const types = ['All', 'TECHNICAL', 'RESEARCH', 'COMMERCIAL', 'OTHER'];

  // ── Fetch offers using real filter values ──
  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedWilaya !== 'all') params.set('wilaya',  selectedWilaya);
      if (selectedType   !== 'all') params.set('type',    selectedType);
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

        {/* Search Bar */}
        <div className="search-bar-section">
          <div className="search-bar">
            <SearchIcon />
            <input type="text" className="search-bar__input"
              placeholder="Search by title, company, or keyword..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {/* Filters — populated from real catalog */}
        <div className="search-filters">
          {/* Location filter */}
          <div className="search-filter-group">
            <h3 className="search-filter-group__title">Location</h3>
            <div className="search-filter-chips">
              <FilterChip label="All" active={selectedWilaya === 'all'} onClick={() => setSelectedWilaya('all')} />
              {catalogWilayas.map(w => (
                <FilterChip key={w} label={w} active={selectedWilaya === w} onClick={() => setSelectedWilaya(w)} />
              ))}
            </div>
          </div>

          {/* Type filter */}
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

          {/* Skills filter — from real catalog */}
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
              <InternshipCard key={offer._id} internship={offer}
                onApply={handleApply} applied={appliedIds.has(offer._id)} />
            ))
          ) : (
            <div className="search-empty">
              <SearchIcon />
              <h3 className="search-empty__title">No internships found</h3>
              <p className="search-empty__text">Try adjusting your filters or search query</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}