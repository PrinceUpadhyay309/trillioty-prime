import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import CharchaForum from './pages/CharchaForum';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: 'var(--bg-main)'
        }}>
          {/* Header */}
          <Navbar />

          {/* Main App Content */}
          <main style={{ flex: '1 0 auto' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/article/:slug" element={<ArticleDetail />} />
              <Route path="/charcha" element={<CharchaForum />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer style={{
            flexShrink: 0,
            borderTop: '1px solid var(--border-color)',
            padding: '2rem 0',
            marginTop: '4rem',
            backgroundColor: 'rgba(0,0,0,0.2)',
            color: 'var(--text-dim)',
            fontSize: '0.8rem',
            textAlign: 'center'
          }}>
            <div className="container" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontWeight: 700, color: 'white', letterSpacing: '0.5px' }}>
                  TRILLIOTY <span style={{ color: 'var(--primary)' }}>PRIME</span>
                </span>
                {' '}© 2026. All rights reserved.
              </div>
              <p>Independently curated Indian digital media agency and citizen journalism platform.</p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
