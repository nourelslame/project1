// src/components/Cards.jsx
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "./Icons";

import { useNavigate } from "react-router-dom";




function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

export function FeatureCard({ icon, title, desc, index }) {
  
  const [ref, visible] = useInView();
    const navigate = useNavigate();
  

  return (
    <div
      ref={ref}
      className="feature-card"
      style={{
        opacity: visible ? 1 : 0,
        animation: visible ? `fadeUp 0.6s cubic-bezier(.22,1,.36,1) ${index * 0.12}s both` : "none",
      }}
    >
      <div className="feature-card__icon">{icon}</div>
      <h3 className="feature-card__title">{title}</h3>
      <p className="feature-card__desc">{desc}</p>
     <div
     className="feature-card__more"
     onClick={() => navigate("/about")}
    style={{ cursor: "pointer" }}
     >
  Learn more <ArrowRight />
</div>
    </div>
  );
}

export function RoleCard({ icon, color, bg, title, desc, index }) {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      className="role-card"
      style={{
        opacity: visible ? 1 : 0,
        animation: visible ? `fadeUp 0.6s cubic-bezier(.22,1,.36,1) ${index * 0.12}s both` : "none",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 12px 40px ${color}22`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.04)"; }}
    >
      <div className="role-card__icon" style={{ background: bg, color }}>{icon}</div>
      <h3 className="role-card__title">{title}</h3>
      <p className="role-card__desc">{desc}</p>
      {/* <a
        href="#"
        className="role-card__cta"
        onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color; e.currentTarget.style.background = `${color}0d`; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#0f0f1a"; e.currentTarget.style.background = "transparent"; }}
      >
        {cta} <ArrowRight />
      </a> */}
    </div>
  );
}

export function StatBadge({ value, label, delay = 0 }) {
  const [ref, visible] = useInView(0.3);
  return (
    <div
      ref={ref}
      className="stat-badge"
      style={{
        opacity: visible ? 1 : 0,
        animation: visible ? `scaleIn 0.45s cubic-bezier(.22,1,.36,1) ${delay}s both` : "none",
      }}
    >
      <div className="stat-badge__value">{value}</div>
      <div className="stat-badge__label">{label}</div>
    </div>
  );
}