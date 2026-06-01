import React, { useMemo, useState } from 'react';
import siteLogo from '../assets/imgs/agencyLogo.png';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoggedIn } = useAuthStore();

  const passwordReady = password.length >= 6;
  const emailReady = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  const canSubmit = emailReady && passwordReady && !loading;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit) {
      setError('Enter a valid email and a password with at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login({
        email: email.trim().toLowerCase(),
        password,
        rememberMe,
      });

      if (!result.status) {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="premium-login">
      <section className="premium-login-visual" aria-label="Business management platform">
        <div className="premium-brand-block">
          <img src={siteLogo} alt="Symbolix" className="premium-brand-logo" />
          <div className="premium-brand-copy">
            <span className="premium-kicker">Business Management System</span>
            <h1>Secure access to your commercial command center.</h1>
            <p>
              Manage invoices, proformas, LPOs, clients, and service operations
              from one polished workspace.
            </p>
          </div>
        </div>

        <div className="premium-insight-card">
          <div>
            <span>Protected workspace</span>
            <strong>Role-based access</strong>
          </div>
          <i className="bi bi-shield-lock" />
        </div>

        <div className="premium-flow-card">
          <div className="premium-flow-step active">
            <i className="bi bi-file-earmark-text" />
            Proforma
          </div>
          <div className="premium-flow-line" />
          <div className="premium-flow-step">
            <i className="bi bi-file-earmark-check" />
            LPO
          </div>
          <div className="premium-flow-line" />
          <div className="premium-flow-step">
            <i className="bi bi-receipt" />
            Invoice
          </div>
        </div>
      </section>

      <section className="premium-login-panel">
        <div className="premium-login-card">
          <div className="premium-card-header">
            <div className="premium-card-mark">
              <i className="bi bi-lock-fill" />
            </div>
            <span>Secure sign in</span>
            <h2>Welcome back</h2>
            <p>Enter your credentials to continue to the dashboard.</p>
          </div>

          {error && (
            <div className="premium-alert" role="alert" aria-live="polite">
              <i className="bi bi-exclamation-circle" />
              <span>{error}</span>
            </div>
          )}

          <form className="premium-form" onSubmit={handleSubmit} noValidate>
            <div className="premium-field">
              <label htmlFor="email">Email address</label>
              <div className={`premium-input-shell ${email && !emailReady ? 'has-error' : ''}`}>
                <i className="bi bi-envelope" />
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  value={email}
                  required
                  aria-invalid={email ? !emailReady : undefined}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </div>

            <div className="premium-field">
              <div className="premium-label-row">
                <label htmlFor="password">Password</label>
                <a href="#" className="premium-link">Forgot password?</a>
              </div>
              <div className={`premium-input-shell ${password && !passwordReady ? 'has-error' : ''}`}>
                <i className="bi bi-key" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  required
                  minLength={6}
                  aria-invalid={password ? !passwordReady : undefined}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="premium-password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                </button>
              </div>
            </div>

            <div className="premium-options">
              <label className="premium-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span>Remember this device</span>
              </label>
              <span className="premium-session-note">
                {rememberMe ? 'Keeps you signed in after closing the browser.' : 'Session-only sign in.'}
              </span>
            </div>

            <button className="premium-submit" type="submit" disabled={!canSubmit}>
              {loading ? (
                <>
                  <span className="premium-spinner" aria-hidden="true" />
                  Signing in...
                </>
              ) : (
                <>
                  Continue securely
                  <i className="bi bi-arrow-right" />
                </>
              )}
            </button>
          </form>

          <div className="premium-security-note">
            <i className="bi bi-shield-check" />
            <span>Encrypted authentication. Never share your password with anyone.</span>
          </div>
        </div>
      </section>
    </main>
  );
}
