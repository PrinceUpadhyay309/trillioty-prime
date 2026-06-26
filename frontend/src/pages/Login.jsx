import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, ShieldAlert, KeyRound, UserPlus } from 'lucide-react';

const Login = () => {
  const { login, register, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isSignUpParam = new URLSearchParams(location.search).get('signup') === 'true';
  const [isSignUp, setIsSignUp] = useState(isSignUpParam);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Reader',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsSignUp(isSignUpParam);
    setErrorMsg('');
  }, [location.search, isSignUpParam]);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (isSignUp) {
      if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
        setErrorMsg('Please fill all registration fields.');
        setLoading(false);
        return;
      }
      const res = await register(formData.name, formData.email, formData.password, formData.role);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    } else {
      if (!formData.email.trim() || !formData.password.trim()) {
        setErrorMsg('Please enter both email and password.');
        setLoading(false);
        return;
      }
      const res = await login(formData.email, formData.password);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      {/* Background themed glowing blobs */}
      <div className="auth-glow-blob auth-glow-blob-1" />
      <div className="auth-glow-blob auth-glow-blob-2" />

      {/* Main split-screen panel */}
      <div className="auth-split-wrapper">
        
        {/* Left Side: Brand Panel */}
        <div className="auth-brand-pane">
          {/* Top Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              letterSpacing: '1px',
              color: 'var(--text-main)',
              fontFamily: 'var(--font-sans)'
            }}>
              TRILLIOTY <span style={{ color: 'var(--primary)' }}>PRIME</span>
            </span>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              boxShadow: 'var(--shadow-glow)'
            }} className="animate-pulse-glow"></div>
          </div>

          {/* Core Tagline & Features */}
          <div style={{ margin: '2rem 0' }}>
            <h1 style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              lineHeight: 1.3,
              color: 'var(--text-main)',
              fontFamily: 'var(--font-serif)',
              marginBottom: '1.25rem'
            }}>
              Democracy's <span style={{ color: 'var(--primary)' }}>Fifth Pillar</span>, Powered by Indian Citizens.
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
              Join the next generation of digital citizen journalism. Report local issues, publish editorial analysis, and debate inside the reputation-backed Charcha network.
            </p>

            {/* Micro Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                <span style={{
                  background: 'var(--primary-glow)',
                  border: '1px solid var(--primary-border)',
                  color: 'var(--primary)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '0.75rem'
                }}>01</span>
                <div>
                  <h4 style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.85rem', marginBottom: '0.15rem' }}>Rapid News Wire</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Publish and discover rapid, regional updates straight from the field.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                <span style={{
                  background: 'var(--primary-glow)',
                  border: '1px solid var(--primary-border)',
                  color: 'var(--primary)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '0.75rem'
                }}>02</span>
                <div>
                  <h4 style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.85rem', marginBottom: '0.15rem' }}>Charcha Discussions</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Participate in debates with professional profiles, YouTube-style Hype, and real-time chat rooms.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Branding */}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            © 2026 Trillioty Prime. Coded for the Indian Media Landscape.
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="auth-form-pane">
          {/* Header Title */}
          <div style={{ marginBottom: '2.25rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              {isSignUp ? 'Join the Forum' : 'Welcome Back'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {isSignUp ? 'Create your professional citizen profile' : 'Sign in to access your dashboard'}
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="auth-alert">
              <ShieldAlert size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {isSignUp && (
              <div className="auth-input-wrapper">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  className="auth-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <User size={18} className="auth-input-icon" />
              </div>
            )}

            <div className="auth-input-wrapper">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className="auth-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Mail size={18} className="auth-input-icon" />
            </div>

            <div className="auth-input-wrapper">
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="auth-input"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <Lock size={18} className="auth-input-icon" />
            </div>

            {isSignUp && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  paddingLeft: '0.2rem'
                }}>
                  Join As
                </label>
                <select
                  name="role"
                  className="auth-select"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="Reader">Reader (Discuss & Hype)</option>
                  <option value="Author">Author (Publish Columns & Wires)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="auth-btn"
              style={{ marginTop: '0.5rem', width: '100%', height: '46px' }}
              disabled={loading}
            >
              {isSignUp ? <UserPlus size={18} /> : <KeyRound size={18} />}
              <span>{loading ? 'Validating details...' : isSignUp ? 'Sign Up' : 'Sign In'}</span>
            </button>
          </form>

          {/* Toggle Switch */}
          <div className="auth-switch-footer">
            <span>
              {isSignUp ? 'Already a member?' : "New to the platform?"}
            </span>{' '}
            <button
              onClick={() => {
                setErrorMsg('');
                setIsSignUp(!isSignUp);
              }}
              className="auth-switch-btn"
            >
              {isSignUp ? 'Sign In' : 'Join Now'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;

