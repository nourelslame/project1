// src/pages/company/NewOffer.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import Btn from "../components/Btn";
import { FieldLabel } from "../components/Input";
import { ArrowRight, ChartIcon, BuildingIcon, CheckIcon, SearchIcon, ArrowLeft } from "../components/Icons";

const BriefcaseIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);
const UsersIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const navItems = [
  { id: "dashboard",  label: "Dashboard",    icon: <ChartIcon /> },
  { id: "profile",    label: "Company Info", icon: <BuildingIcon /> },
  { id: "offers",     label: "Manage Offers",icon: <BriefcaseIcon /> },
  { id: "candidates", label: "Candidates",   icon: <UsersIcon /> },
];

const ALL_SKILLS = [
  "React", "Vue.js", "Angular", "Next.js", "Node.js", "Express", "Django",
  "FastAPI", "Laravel", "Spring Boot", "Python", "Java", "JavaScript",
  "TypeScript", "PHP", "C++", "MongoDB", "PostgreSQL", "MySQL", "Firebase",
  "Docker", "Git", "Linux", "AWS", "React Native", "Flutter",
];

const wilayas = [
  "Algiers","Oran","Constantine","Annaba","Sétif","Béjaïa","Blida","Batna",
  "Tizi Ouzou","Tlemcen","Boumerdès","Médéa","Bouira","Jijel","Skikda",
  "Mostaganem","Ouargla","Guelma","Biskra","Chlef",
];

const emptyOffer = {
  title: "", description: "", skills: [], wilaya: "Algiers",
  duration: "", slots: 1, deadline: "", type: "onsite", status: "open",
};

export default function NewOffer() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(emptyOffer);
  const [skillSearch, setSkillSearch] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const upd = (key, val) => setFormData(f => ({ ...f, [key]: val }));

  const toggleSkill = (sk) => {
    setFormData(f => ({
      ...f,
      skills: f.skills.includes(sk) ? f.skills.filter(s => s !== sk) : [...f.skills, sk],
    }));
  };

  const filteredSkills = ALL_SKILLS.filter(sk =>
    sk.toLowerCase().includes(skillSearch.toLowerCase())
  );

  const validateStep1 = () => {
    if (!formData.title.trim()) {
      alert("Please enter an offer title");
      return false;
    }
    if (!formData.description.trim()) {
      alert("Please enter a description");
      return false;
    }
    if (formData.skills.length === 0) {
      alert("Please select at least one skill");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.duration) {
      alert("Please select a duration");
      return false;
    }
    if (!formData.deadline) {
      alert("Please select a deadline");
      return false;
    }
    if (formData.slots < 1) {
      alert("Please enter a valid number of slots");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newOffer = {
        ...formData,
        id: Date.now(),
        applicants: 0,
      };
      
      // Get existing offers from localStorage or use empty array
      const existingOffers = JSON.parse(localStorage.getItem('company_offers') || '[]');
      const updatedOffers = [...existingOffers, newOffer];
      localStorage.setItem('company_offers', JSON.stringify(updatedOffers));
      
      setIsSubmitting(false);
      
      // Navigate back to offers page with success message
      navigate("/company/offers", { state: { success: true, message: "Offer created successfully!" } });
    }, 1000);
  };

  const typeLabel = { onsite: "On-site", remote: "Remote", hybrid: "Hybrid" };

  return (
    <div className="new-offer-dashboard">
      {/* Sidebar */}
      <aside className="new-offer-sidebar">
        <div className="new-offer-sidebar__logo"><Logo /></div>
        <nav className="new-offer-sidebar__nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`new-offer-sidebar__nav-item ${
                item.id === "offers" ? "new-offer-sidebar__nav-item--active" : ""
              }`}
              onClick={() => {
                if (item.id === "dashboard") navigate("/company/dashboard");
                if (item.id === "profile") navigate("/company/profile");
                if (item.id === "offers") navigate("/company/offers");
                if (item.id === "candidates") navigate("/company/candidates");
              }}
            >
              <span className="new-offer-sidebar__nav-icon">{item.icon}</span>
              <span className="new-offer-sidebar__nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="new-offer-sidebar__user">
          <div className="new-offer-sidebar__avatar" style={{ background: "rgba(16,185,129,.2)", color: "#10b981" }}>TC</div>
          <div className="new-offer-sidebar__user-info">
            <div className="new-offer-sidebar__user-name">Tech Innovate</div>
            <div className="new-offer-sidebar__user-role">Company · Algiers</div>
          </div>
          <button className="new-offer-sidebar__logout" onClick={() => navigate("/")} title="Logout">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="new-offer-main">
        {/* Header */}
        <div className="new-offer-header">
          <button className="new-offer-back-btn" onClick={() => navigate("/company/offers")}>
            <ArrowLeft />
            <span>Back to Offers</span>
          </button>
          <div className="new-offer-progress">
            <div className={`new-offer-progress-step ${currentStep >= 1 ? 'active' : ''}`}>
              <span className="new-offer-progress-number">1</span>
              <span className="new-offer-progress-label">Basic Info</span>
            </div>
            <div className="new-offer-progress-line"></div>
            <div className={`new-offer-progress-step ${currentStep >= 2 ? 'active' : ''}`}>
              <span className="new-offer-progress-number">2</span>
              <span className="new-offer-progress-label">Details</span>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="new-offer-container">
          <div className="new-offer-card">
            <div className="new-offer-card-header">
              <h1 className="new-offer-title">Create New Internship Offer</h1>
              <p className="new-offer-subtitle">Fill in the details below to create a new internship position</p>
            </div>

            {currentStep === 1 && (
              <div className="new-offer-step">
                {/* Title */}
                <div className="new-offer-field">
                  <label className="new-offer-label">Offer Title <span className="required">*</span></label>
                  <input
                    className="new-offer-input"
                    value={formData.title}
                    onChange={e => upd("title", e.target.value)}
                    placeholder="e.g., Full Stack Development Internship"
                  />
                  <p className="new-offer-hint">Choose a clear, descriptive title for your internship</p>
                </div>

                {/* Description */}
                <div className="new-offer-field">
                  <label className="new-offer-label">Description <span className="required">*</span></label>
                  <textarea
                    className="new-offer-textarea"
                    rows={5}
                    value={formData.description}
                    onChange={e => upd("description", e.target.value)}
                    placeholder="Describe the internship tasks, responsibilities, learning opportunities, and requirements..."
                  />
                </div>

                {/* Skills */}
                <div className="new-offer-field">
                  <label className="new-offer-label">Required Skills <span className="required">*</span></label>
                  <div className="new-offer-skill-search">
                    <SearchIcon />
                    <input
                      className="new-offer-skill-input"
                      placeholder="Search skills..."
                      value={skillSearch}
                      onChange={e => setSkillSearch(e.target.value)}
                    />
                  </div>
                  
                  {formData.skills.length > 0 && (
                    <div className="new-offer-selected-skills">
                      {formData.skills.map(sk => (
                        <div key={sk} className="new-offer-skill-tag">
                          {sk}
                          <button className="new-offer-skill-remove" onClick={() => toggleSkill(sk)}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="new-offer-skills-grid">
                    {filteredSkills.map(sk => {
                      const active = formData.skills.includes(sk);
                      return (
                        <button
                          key={sk}
                          className={`new-offer-skill-btn ${active ? 'active' : ''}`}
                          onClick={() => toggleSkill(sk)}
                        >
                          {active && <CheckIcon />}
                          {sk}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="new-offer-step">
                <div className="new-offer-grid">
                  {/* Wilaya */}
                  <div className="new-offer-field">
                    <label className="new-offer-label">Wilaya</label>
                    <select
                      className="new-offer-select"
                      value={formData.wilaya}
                      onChange={e => upd("wilaya", e.target.value)}
                    >
                      {wilayas.map(w => <option key={w}>{w}</option>)}
                    </select>
                  </div>

                  {/* Type */}
                  <div className="new-offer-field">
                    <label className="new-offer-label">Work Type</label>
                    <select
                      className="new-offer-select"
                      value={formData.type}
                      onChange={e => upd("type", e.target.value)}
                    >
                      <option value="onsite">On-site</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  {/* Duration */}
                  <div className="new-offer-field">
                    <label className="new-offer-label">Duration <span className="required">*</span></label>
                    <select
                      className="new-offer-select"
                      value={formData.duration}
                      onChange={e => upd("duration", e.target.value)}
                    >
                      <option value="">Select duration</option>
                      {["1 month","2 months","3 months","4 months","6 months"].map(d => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Slots */}
                  <div className="new-offer-field">
                    <label className="new-offer-label">Available Slots <span className="required">*</span></label>
                    <input
                      className="new-offer-input"
                      type="number"
                      min={1}
                      max={20}
                      value={formData.slots}
                      onChange={e => upd("slots", parseInt(e.target.value) || 1)}
                    />
                  </div>

                  {/* Deadline */}
                  <div className="new-offer-field">
                    <label className="new-offer-label">Application Deadline <span className="required">*</span></label>
                    <input
                      className="new-offer-input"
                      type="date"
                      value={formData.deadline}
                      onChange={e => upd("deadline", e.target.value)}
                    />
                  </div>

                  {/* Status */}
                  <div className="new-offer-field">
                    <label className="new-offer-label">Status</label>
                    <select
                      className="new-offer-select"
                      value={formData.status}
                      onChange={e => upd("status", e.target.value)}
                    >
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                {/* Preview Section */}
                <div className="new-offer-preview">
                  <h3 className="new-offer-preview-title">Preview</h3>
                  <div className="new-offer-preview-card">
                    <h4>{formData.title || "Untitled Offer"}</h4>
                    <div className="new-offer-preview-meta">
                      <span>{formData.wilaya}</span>
                      <span>{formData.duration || "Duration TBD"}</span>
                      <span>{typeLabel[formData.type]}</span>
                      <span>{formData.slots} slot{formData.slots !== 1 ? "s" : ""}</span>
                    </div>
                    <p className="new-offer-preview-desc">{formData.description || "No description provided"}</p>
                    {formData.skills.length > 0 && (
                      <div className="new-offer-preview-skills">
                        {formData.skills.slice(0, 5).map(skill => (
                          <span key={skill} className="new-offer-preview-skill">{skill}</span>
                        ))}
                        {formData.skills.length > 5 && (
                          <span className="new-offer-preview-skill">+{formData.skills.length - 5}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="new-offer-actions">
              {currentStep === 2 && (
                <button className="new-offer-btn-back" onClick={handleBack}>
                  Back
                </button>
              )}
              {currentStep === 1 && (
                <button className="new-offer-btn-next" onClick={handleNext}>
                  Next Step
                  <ArrowRight />
                </button>
              )}
              {currentStep === 2 && (
                <button
                  className="new-offer-btn-submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      Publishing...
                    </>
                  ) : (
                    <>
                      Publish Offer
                      <ArrowRight />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}