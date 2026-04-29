// src/pages/HomePage.jsx
import { useState, useEffect, useRef } from "react";
import Logo from "../components/Logo";
import Btn from "../components/Btn";
import { FeatureCard, RoleCard } from "../components/Cards";
import { SearchIcon, DocIcon, ChartIcon, GradCapIcon, BuildingIcon, ShieldIcon, ArrowRight } from "../components/Icons";
import { useNavigate } from "react-router-dom";

/* ── Animated floating orb ── */
function Orb({ style }) {
  return <div className="hp-orb" style={style} />;
}

/* ── Floating particle dot ── */
function Particles() {
  const dots = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1.5 + Math.random() * 2.5,
    dur: 6 + Math.random() * 10,
    delay: Math.random() * 8,
    drift: (Math.random() - 0.5) * 60,
  }));
  return (
    <div className="hp-particles" aria-hidden>
      {dots.map(d => (
        <span key={d.id} className="hp-particle" style={{
          left: `${d.x}%`, top: `${d.y}%`,
          width: d.size, height: d.size,
          animationDuration: `${d.dur}s`,
          animationDelay: `${-d.delay}s`,
          "--drift": `${d.drift}px`,
        }} />
      ))}
    </div>
  );
}

/* ── Grid mesh background ── */
function GridMesh() {
  return <div className="hp-grid" aria-hidden />;
}

/* ── Animated stat counter ── */
function Stat({ value, label, delay }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const end = parseInt(value);
        const inc = Math.ceil(end / 55);
        const t = setInterval(() => {
          start += inc;
          if (start >= end) { setCount(end); clearInterval(t); }
          else setCount(start);
        }, 22);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);
  return (
    <div ref={ref} className="hp-stat" style={{ animationDelay: delay }}>
      <span className="hp-stat__num">{count.toLocaleString()}+</span>
      <span className="hp-stat__label">{label}</span>
    </div>
  );
}

/* ── Reveal on scroll ── */
function Reveal({ children, className = "", delay = "0s" }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`hp-reveal ${vis ? "hp-reveal--in" : ""} ${className}`} style={{ transitionDelay: delay }}>
      {children}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const features = [
    { icon: <SearchIcon />,  title: "Smart Matching",       desc: "Find the perfect internship or candidate through skill-based filtering and intelligent search." },
    { icon: <DocIcon />,     title: "Automated Documents",  desc: "Generate internship agreements and certificates automatically — no more paperwork." },
    { icon: <ChartIcon />,   title: "Centralized Tracking", desc: "University administration can validate, track, and monitor all student placements in one dashboard." },
  ];

  const roles = [
    { icon: <GradCapIcon />,  color: "#a78bfa", bg: "rgba(167,139,250,.1)",  title: "Students",       desc: "Build your digital CV, search internship offers, and apply with one click.",         cta: "Join as Students" },
    { icon: <BuildingIcon />, color: "#34d399", bg: "rgba(52,211,153,.1)",   title: "Companies",      desc: "Post offers, review candidates, and manage your recruitment pipeline effortlessly.", cta: "Join as Companies" },
    { icon: <ShieldIcon />,   color: "#fbbf24", bg: "rgba(251,191,36,.1)",   title: "Administration", desc: "Validate internships, generate official documents, and view placement statistics.",    cta: "Join as Administration" },
  ];

  return (
    <div className="hp-root">

      {/* ── NAVBAR ── */}
      <nav className={`hp-nav ${scrolled ? "hp-nav--solid" : ""}`}>
        <div className="hp-nav__inner">
          <Logo />
          <div className={`hp-nav__links ${menuOpen ? "hp-nav__links--open" : ""}`}>
            <a href="#features" className="hp-nav__link" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#roles"    className="hp-nav__link" onClick={() => setMenuOpen(false)}>For Who</a>
            <div className="hp-nav__sep" />
            <button className="hp-nav__btn hp-nav__btn--ghost" onClick={() => { navigate('/login'); setMenuOpen(false); }}>Log in</button>
            <button className="hp-nav__btn hp-nav__btn--primary" onClick={() => { navigate('/register'); setMenuOpen(false); }}>Get Started</button>
          </div>
          <button className="hp-nav__burger" onClick={() => setMenuOpen(p => !p)} aria-label="Menu">
            <span className={menuOpen ? "open" : ""} />
            <span className={menuOpen ? "open" : ""} />
            <span className={menuOpen ? "open" : ""} />
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hp-hero">
        <GridMesh />
        <Particles />

        {/* Background orbs */}
        <Orb style={{ width: 700, height: 700, top: "-18%", left: "-12%", background: "radial-gradient(circle, rgba(109,40,217,.18) 0%, transparent 70%)", animationDuration: "18s" }} />
        <Orb style={{ width: 500, height: 500, top: "10%", right: "-10%", background: "radial-gradient(circle, rgba(139,92,246,.12) 0%, transparent 70%)", animationDuration: "24s", animationDelay: "-6s" }} />
        <Orb style={{ width: 350, height: 350, bottom: "5%", left: "30%", background: "radial-gradient(circle, rgba(167,139,250,.10) 0%, transparent 70%)", animationDuration: "20s", animationDelay: "-10s" }} />

        {/* Decorative rings */}
        <div className="hp-hero__rings" aria-hidden>
          {[640, 460, 290, 150].map((s, i) => (
            <div key={i} className="hp-hero__ring" style={{
              width: s, height: s,
              opacity: 0.06 + i * 0.015,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${14 + i * 4}s`,
            }} />
          ))}
        </div>

        <div className="hp-hero__content">
          <div className="hp-hero__badge">
            <span className="hp-hero__badge-pulse" />
            <span>University × Enterprise Platform</span>
          </div>

          <h1 className="hp-hero__title">
            <span className="hp-hero__title-line">Where Talent</span>
            <span className="hp-hero__title-line">Meets{" "}
              <span className="hp-hero__title-glow">
                Opportunity
                <svg className="hp-hero__underline" viewBox="0 0 320 18" fill="none" preserveAspectRatio="none">
                  <path d="M2 14 C80 4, 200 4, 318 14" stroke="url(#uGrad)" strokeWidth="3.5" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="uGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#7c3aed"/>
                      <stop offset="100%" stopColor="#a78bfa"/>
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </span>
          </h1>

          <p className="hp-hero__sub">
            Stag.io connects students seeking internships with companies looking for fresh talent — while automating the entire administrative workflow.
          </p>

          <div className="hp-hero__actions">
            <button className="hp-cta-btn" onClick={() => navigate('/register')}>
              <span>Get Started Free</span>
              <ArrowRight />
            </button>
            <button className="hp-outline-btn" onClick={() => navigate('/about')}>
              Learn More
            </button>
          </div>

          <div className="hp-hero__stats">
            <Stat value="1200" label="Students" delay="0s" />
            <div className="hp-stat-div" />
            <Stat value="340" label="Companies" delay="0.1s" />
            <div className="hp-stat-div" />
            <Stat value="95" label="Placements" delay="0.2s" />
          </div>
        </div>

        {/* Hero Big Logo */}
        <div className="hp-hero__big-logo" aria-hidden>
          {/* Outer glow rings */}
          <div className="hp-big-logo__halo hp-big-logo__halo--1" />
          <div className="hp-big-logo__halo hp-big-logo__halo--2" />
          <div className="hp-big-logo__halo hp-big-logo__halo--3" />
          {/* Orbit tracks */}
          <div className="hp-big-logo__orbit hp-big-logo__orbit--1">
            <div className="hp-big-logo__dot hp-big-logo__dot--a" />
          </div>
          <div className="hp-big-logo__orbit hp-big-logo__orbit--2">
            <div className="hp-big-logo__dot hp-big-logo__dot--b" />
          </div>
          <div className="hp-big-logo__orbit hp-big-logo__orbit--3">
            <div className="hp-big-logo__dot hp-big-logo__dot--c" />
          </div>
          {/* Core icon */}
          <div className="hp-big-logo__core">
            <div className="hp-big-logo__inner-ring" />
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
  <path d="M22 10v6M2 10l10-5 10 5-10 5z" fill="url(#grad)" />
  <path d="M6 12v5c3 3 9 3 12 0v-5" fill="url(#grad)" />
  
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#fff" />
      <stop offset="100%" stopColor="#c4b5fd" />
    </linearGradient>
  </defs>
</svg>
          </div>
          {/* Text below */}
          <div className="hp-big-logo__text">
            <span className="hp-big-logo__name">Stag</span><span className="hp-big-logo__io">.io</span>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="hp-section" id="features">
        <div className="hp-section__bg-orb" style={{ left: "-5%", top: "20%", background: "radial-gradient(circle, rgba(109,40,217,.08) 0%, transparent 65%)", width: 500, height: 500 }} />
        <div className="hp-section__inner">
          <Reveal>
            <div className="hp-section__head">
              <span className="hp-label">Features</span>
              <h2 className="hp-section__title">Everything You Need</h2>
              <p className="hp-section__sub">A centralized platform to digitize internship management from search to certificate.</p>
            </div>
          </Reveal>
          <div className="hp-cards-grid">
            {features.map((f, i) => (
              <Reveal key={i} delay={`${i * 0.12}s`}>
                <div className="hp-feature-card">
                  <div className="hp-feature-card__glow" />
                  <div className="hp-feature-card__icon">{f.icon}</div>
                  <h3 className="hp-feature-card__title">{f.title}</h3>
                  <p className="hp-feature-card__desc">{f.desc}</p>
                  <div className="hp-feature-card__arrow"><ArrowRight /></div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section className="hp-section hp-section--alt" id="roles">
        <div className="hp-section__bg-orb" style={{ right: "-8%", bottom: "10%", background: "radial-gradient(circle, rgba(167,139,250,.07) 0%, transparent 65%)", width: 600, height: 600 }} />
        <div className="hp-section__inner">
          <Reveal>
            <div className="hp-section__head">
              <span className="hp-label">Roles</span>
              <h2 className="hp-section__title">Built for Everyone</h2>
              <p className="hp-section__sub">Three tailored spaces for students, companies, and university administration.</p>
            </div>
          </Reveal>
          <div className="hp-roles-grid">
            {roles.map((r, i) => (
              <Reveal key={i} delay={`${i * 0.14}s`}>
                <div className="hp-role-card" style={{ "--role-color": r.color, "--role-bg": r.bg }}>
                  <div className="hp-role-card__icon-wrap">
                    <div className="hp-role-card__icon">{r.icon}</div>
                  </div>
                  <h3 className="hp-role-card__title">{r.title}</h3>
                  <p className="hp-role-card__desc">{r.desc}</p>
                  
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="hp-cta-section">
        <div className="hp-cta-section__orb hp-cta-section__orb--l" />
        <div className="hp-cta-section__orb hp-cta-section__orb--r" />
        <GridMesh />
        <Reveal>
          <div className="hp-cta-section__inner">
            <span className="hp-label hp-label--light">Get Started Today</span>
            <h2 className="hp-cta-section__title">
              Ready to find your<br />perfect <span className="hp-cta-section__accent">match?</span>
            </h2>
            <p className="hp-cta-section__sub">Join thousands of students and companies already using Stag.io.</p>
            <button className="hp-cta-btn hp-cta-btn--lg" onClick={() => navigate('/register')}>
              <span>Get Started Free</span>
              <ArrowRight />
            </button>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer className="hp-footer">
        <div className="hp-footer__inner">
          <div className="hp-footer__brand">
            <Logo />
            <p className="hp-footer__tagline">Bridging talent and opportunity.</p>
          </div>
          <div className="hp-footer__contact">
            <p>groupe@stag.io</p>
            <p>+213 555 00 00 00</p>
            <p>Constantine, Algeria</p>
          </div>
        </div>
        <div className="hp-footer__bottom">
          <p>© 2026 Stag.io · All rights reserved</p>
        </div>
      </footer>

    </div>
  );
}