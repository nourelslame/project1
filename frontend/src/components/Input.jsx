// src/components/Input.jsx
// Updated to accept value + onChange props for controlled inputs
import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from './Icons';

export function Input({ placeholder, type = 'text', value, onChange, onKeyDown }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className="input"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
    />
  );
}

export function PasswordInput({ placeholder, value, onChange, onKeyDown }) {
  const [show, setShow] = useState(false);
  return (
    <div className="input-password-wrap">
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        className="input"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
      <button className="input-eye-btn" onClick={() => setShow(s => !s)} type="button">
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

export function FieldLabel({ children }) {
  return <label className="field-label">{children}</label>;
}

export function Divider() {
  return (
    <div className="divider">
      <div className="divider__line" />
      <span className="divider__text">OR</span>
      <div className="divider__line" />
    </div>
  );
}