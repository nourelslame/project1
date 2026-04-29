// src/components/Logo.jsx
export default function Logo() {
  return (
    <div className="logo-v2">
      <div className="logo-v2__icon">
        {/* Animated orbital rings */}
        <div className="logo-v2__ring logo-v2__ring--1" />
        <div className="logo-v2__ring logo-v2__ring--2" />
        {/* Core dot */}
        <div className="logo-v2__core">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
        </div>
      </div>
      <span className="logo-v2__text">
        Stag<span className="logo-v2__dot">.io</span>
      </span>
    </div>
  );
}
