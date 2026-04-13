// src/pages/HomePage.jsx
import { useState, useEffect } from "react";
import Logo from "../components/Logo";
import Btn from "../components/Btn";
import { FeatureCard, RoleCard } from "../components/Cards";
import { SearchIcon, DocIcon, ChartIcon, GradCapIcon, BuildingIcon, ShieldIcon, ArrowRight } from "../components/Icons";

import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const features = [
    { icon: <SearchIcon />,  title: "Smart Matching",       desc: "Find the perfect internship or candidate through skill-based filtering and intelligent search." },
    { icon: <DocIcon />,     title: "Automated Documents",  desc: "Generate internship agreements and certificates automatically — no more paperwork." },
    { icon: <ChartIcon />,   title: "Centralized Tracking", desc: "University administration can validate, track, and monitor all student placements in one dashboard." },
  ];

  const roles = [
    { icon: <GradCapIcon />,  color: "#7c3aed", bg: "rgba(124,58,237,.1)",  title: "Students",       desc: "Build your digital CV, search internship offers, and apply with one click.",         cta: "Join as Students" },
    { icon: <BuildingIcon />, color: "#10b981", bg: "rgba(16,185,129,.1)",   title: "Companies",      desc: "Post offers, review candidates, and manage your recruitment pipeline effortlessly.", cta: "Join as Companies" },
    { icon: <ShieldIcon />,   color: "#f59e0b", bg: "rgba(245,158,11,.1)",   title: "Administration", desc: "Validate internships, generate official documents, and view placement statistics.",    cta: "Join as Administration" },
  ];

  return (
    <div>
      {/* ── NAVBAR ── */}
      <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
        <Logo />
        <div className="navbar__links">
          <a href="#gg" className="nav-link">Features</a>
          <a href="#hh" className="nav-link">For Who</a>
          <Btn variant="ghost"   onClick={() => navigate('/login')}    style={{ padding: "8px 20px", fontSize: "14px" }}>Log in</Btn>
          <Btn variant="primary" onClick={() => navigate('/register')} style={{ padding: "8px 20px", fontSize: "14px" }}>Get Started</Btn>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        {[700, 500, 320].map((s, i) => (
          <div key={i} className="hero__ring" style={{ width: s, height: s, border: `1px solid rgba(124,58,237,${.06 + i * .02})`, animationDelay: `${i * 0.15}s` }} />
        ))}

        <div className="hero__badge">
          <span className="hero__badge-dot">✦</span>
          <span className="hero__badge-text">University × Enterprise Platform</span>
        </div>

        <h1 className="hero__title">
          Where Talent Meets<br />
          <span className="hero__title-accent">Opportunity</span>
        </h1>

        <p className="hero__subtitle">
          Stag.io connects students seeking internships with companies looking for fresh talent — while automating the entire administrative workflow.
        </p>

        <div className="hero__actions">
          <Btn variant="primary" onClick={() => navigate('/register')} style={{ padding: "14px 36px", fontSize: "16px" }}>
            Get Started <ArrowRight />
          </Btn>
           
           <Btn
           variant="outline"
           style={{ padding: "14px 36px", fontSize: "16px" }}
           onClick={() => navigate("/about")}
           >
           Learn More
           </Btn>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section section--white" id="gg">
        <div className="section__inner">
          <p className="section__label">Features</p>
          <h2 className="section__title section__title--dark">Everything You Need</h2>
          <p className="section__sub">A centralized platform to digitize internship management from search to certificate.</p>
          <div className="cards-grid">
            {features.map((f, i) => <FeatureCard key={i} {...f} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section className="section section--gray" id="hh">
        <div className="section__inner">
          <p className="section__label">Roles</p>
          <h2 className="section__title section__title--dark">Built for Everyone</h2>
          <p className="section__sub">Three tailored spaces for students, companies, and university administration.</p>
          <div className="cards-grid">
            {roles.map((r, i) => <RoleCard key={i} {...r} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section section--dark">
        <div className="section__inner">
          <p className="section__label">Get Started Today</p>
          <h2 className="section__title section__title--light">
            Ready to find your<br />perfect <span className="section__title--accent">match?</span>
          </h2>
          <p className="section__sub">Join thousands of students and companies already using Stag.io.</p>
          <Btn variant="primary" onClick={() => navigate('/register')} style={{ padding: "16px 44px", fontSize: "16px" }}>
            Get Started Free <ArrowRight />
          </Btn>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
  <Logo />

  <div className="footer__copy">
    <p>Email: groupe@stag.io</p>
    <p>Phone: +213 555 00 00 00</p>
    <p>Address: Constantine</p>
  </div>

  <p className="footer__copy">
    © 2026 Stag.io · All rights reserved
  </p>
</footer>
    </div>
  );
}