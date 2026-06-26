import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { AlertCircle } from 'lucide-react';

const NewsTicker = () => {
  const [headlines, setHeadlines] = useState([]);

  useEffect(() => {
    fetchHeadlines();
  }, []);

  const fetchHeadlines = async () => {
    try {
      // Fetch only quick-news type
      const res = await api.get('/articles?type=News&limit=5');
      if (res.data.success && res.data.data.length > 0) {
        setHeadlines(res.data.data);
      } else {
        // Fallback static headlines if none found
        setHeadlines([
          { _id: '1', slug: '#', title: 'Breaking: ISRO plans next-generation Earth observation satellite launch.' },
          { _id: '2', slug: '#', title: 'Tech Alert: Bengaluru outer ring road waterlogging updates.' },
          { _id: '3', slug: '#', title: 'Finance: UPI micro-transactions hit historic records in rural segments.' },
        ]);
      }
    } catch (err) {
      console.error('Failed to load headlines for ticker', err);
    }
  };

  if (headlines.length === 0) return null;

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border-color)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.5rem 0',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      marginBottom: '1.5rem',
      userSelect: 'none'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        position: 'relative'
      }}>
        {/* Label badge */}
        <div style={{
          background: 'var(--accent-orange)',
          color: 'white',
          fontSize: '0.75rem',
          fontWeight: 800,
          padding: '0.25rem 0.75rem',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          zIndex: 10,
          boxShadow: 'var(--shadow-sm)',
          marginRight: '1.25rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          <AlertCircle size={12} />
          <span>Agency Wire</span>
        </div>

        {/* Scroll Container */}
        <div className="ticker-wrap" style={{
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          display: 'flex',
          flex: 1
        }}>
          <div className="ticker-scroll" style={{
            display: 'inline-flex',
            animation: 'ticker 25s linear infinite',
            gap: '3rem',
            paddingRight: '3rem'
          }}>
            {/* Display headlines twice for infinite loops */}
            {[...headlines, ...headlines].map((item, idx) => (
              <Link
                key={`${item._id}-${idx}`}
                to={item.slug !== '#' ? `/article/${item.slug}` : '/'}
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                className="ticker-item"
              >
                <span style={{ color: 'var(--accent-orange)', fontWeight: 800 }}>•</span>
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .ticker-wrap:hover .ticker-scroll {
          animation-play-state: paused;
        }
        .ticker-item:hover {
          color: var(--accent-orange) !important;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default NewsTicker;
