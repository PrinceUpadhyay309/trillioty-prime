import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Search, LogOut, User, LayoutDashboard, MessageSquare, Home, Award } from 'lucide-react';

const Navbar = ({ onSearch }) => {
  const { user, logout } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);


  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogoClick = () => {
    setSearchQuery('');
    if (onSearch) onSearch('');
  };

  return (
    <nav className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0.75rem 0',
      borderBottom: '1px solid var(--border-color)',
      marginBottom: '1rem'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Logo */}
        <Link to="/" onClick={handleLogoClick} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontSize: '1.5rem',
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
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{
          position: 'relative',
          flex: '1',
          maxWidth: '400px',
          minWidth: '200px'
        }}>
          <input
            type="text"
            placeholder="Search news, topics, articles..."
            className="input-field"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              paddingLeft: '2.5rem',
              height: '40px',
              fontSize: '0.9rem'
            }}
          />
          <Search size={16} style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-dim)'
          }} />
        </form>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link to="/" onClick={handleLogoClick} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.95rem',
            fontWeight: 500,
            color: 'var(--text-main)'
          }} className="nav-link-hover">
            <Home size={16} />
            <span>Wire</span>
          </Link>
          <Link to="/charcha" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.95rem',
            fontWeight: 500,
            color: 'var(--text-main)'
          }} className="nav-link-hover">
            <MessageSquare size={16} />
            <span>Charcha</span>
          </Link>

          {/* Theme Switcher Dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0 0.5rem' }} title="Switch Theme">
            {[
              { id: 'light', color: '#f3f4f6', border: '1px solid rgba(0,0,0,0.15)', name: 'Light Pencil' },
              { id: 'dark', color: '#151d30', border: '1px solid rgba(255,255,255,0.15)', name: 'Midnight Dark' },
              { id: 'blue', color: '#3b82f6', border: 'none', name: 'Ocean Blue' },
              { id: 'orange', color: '#ea580c', border: 'none', name: 'Clay Orange' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: t.color,
                  border: theme === t.id ? '2px solid var(--primary)' : t.border,
                  cursor: 'pointer',
                  transform: theme === t.id ? 'scale(1.25)' : 'scale(1.0)',
                  transition: 'transform var(--transition-fast)',
                  boxShadow: theme === t.id ? '0 0 6px var(--primary)' : 'none'
                }}
                title={t.name}
              />
            ))}
          </div>

          <span style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)' }}></span>

          {/* User Section */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Dashboard Link for creators */}
              {['Admin', 'Editor', 'Author'].includes(user.role) && (
                <Link to="/dashboard" className="btn-secondary" style={{ padding: '0.5rem 1rem', height: '38px', fontSize: '0.85rem' }}>
                  <LayoutDashboard size={15} />
                  <span style={{ display: 'none', md: 'inline' }}>Studio</span>
                </Link>
              )}

              {/* User badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1.5px solid var(--border-color)'
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{user.name.split(' ')[0]}</span>
                  <span style={{
                    fontSize: '0.7rem',
                    color: 'var(--accent-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}>
                    <Award size={10} />
                    {user.reputation || 0}
                  </span>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                style={{
                  cursor: 'pointer',
                  color: 'var(--text-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.5rem',
                  borderRadius: '6px'
                }}
                title="Logout"
                className="nav-link-hover"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/login" className="btn-secondary" style={{ padding: '0.5rem 1rem', height: '38px', fontSize: '0.85rem' }}>
                Sign In
              </Link>
              <Link to="/login?signup=true" className="btn-primary" style={{ padding: '0.5rem 1rem', height: '38px', fontSize: '0.85rem' }}>
                Join
              </Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .nav-link-hover:hover {
          color: var(--primary) !important;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
