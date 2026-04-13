// src/pages/ForgotPasswordPage.jsx
import { useState } from "react";
import Logo from "../components/Logo";
import Btn from "../components/Btn";
import { Input, FieldLabel } from "../components/Input";
import { ArrowRight } from "../components/Icons";

import { useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // هنا يتم إرسال الإيميل للسيرفر
    setSubmitted(true);
  };

  return (
    <div className="auth-page auth-page--forgot">

      {/* ── LEFT ── */}
      <div className="auth-left">
        <div className="auth-left__logo"><Logo /></div>

        <h2 className="auth-left__title">
          Reset your<br />
          <span className="auth-left__title-accent">password</span>
        </h2>

        <p className="auth-left__sub">
          Don't worry! It happens. Enter your email and we'll send you a link to reset your password.
        </p>

        <div className="forgot-illustration">
          <svg width="240" height="240" viewBox="0 0 240 240" fill="none">
            <circle cx="120" cy="120" r="80" fill="rgba(124,58,237,.1)" />
            <path d="M120 80v40m0 20v.01" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" />
            <circle cx="120" cy="120" r="60" stroke="#7c3aed" strokeWidth="2.5" opacity="0.3" />
          </svg>
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div className="auth-right">
        <button className="auth-right__close" onClick={() => navigate('/login')}>✕</button>

        <div className="auth-right__body">
          {!submitted ? (
            <>
              <div className="auth-right__heading">
                <span className="auth-right__heading-icon">🔑</span>
                <span className="auth-right__heading-text">Forgot Password</span>
              </div>
              <p className="auth-right__sub">Enter your email to receive a reset link</p>

              <form onSubmit={handleSubmit}>
                <div className="auth-right__field--last">
                  <FieldLabel>Email Address</FieldLabel>
                  <Input
                    placeholder="you@university.dz"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Btn variant="primary" full style={{ padding: "14px", fontSize: "15px", marginTop: "24px" }}>
                  Send Reset Link <ArrowRight />
                </Btn>
              </form>

              <div className="forgot-back">
                <button
                  className="forgot-back-btn"
                  onClick={() => navigate('/login')}
                >
                  ← Back to Login
                </button>
              </div>
            </>
          ) : (
            <div className="forgot-success">
              <div className="forgot-success__icon">✓</div>
              <h3 className="forgot-success__title">Check your email!</h3>
              <p className="forgot-success__message">
                We've sent a password reset link to<br />
                <strong>{email}</strong>
              </p>
              <p className="forgot-success__note">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  className="forgot-success__resend"
                  onClick={() => setSubmitted(false)}
                >
                  try again
                </button>
              </p>
              <Btn
                variant="outline"
                full
                onClick={() => navigate('/login')}
                style={{ padding: "14px", fontSize: "15px", marginTop: "32px" }}
              >
                Back to Login
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}