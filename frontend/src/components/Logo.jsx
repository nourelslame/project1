// src/components/Logo.jsx
import { LogoIcon } from './Icons';

export default function Logo() {
  return (
    <div className="logo">
      <div className="logo__icon"><LogoIcon /></div>
      <span className="logo__text">Stag.io</span>
    </div>
  );
}