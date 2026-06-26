import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Clock, Bookmark, Share2 } from 'lucide-react';

const ArticleCard = ({ article, isBookmarked = false, onBookmarkToggle }) => {
  const { title, slug, summary, bannerImage, author, category, type, readTime, views, createdAt } = article;

  const handleBookmarkClick = (e) => {
    e.preventDefault();
    if (onBookmarkToggle) {
      onBookmarkToggle(article._id);
    }
  };

  const handleShareClick = (e) => {
    e.preventDefault();
    const shareUrl = `${window.location.origin}/article/${slug}`;
    if (navigator.share) {
      navigator.share({
        title,
        text: summary,
        url: shareUrl,
      }).catch(console.error);
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      alert('Article link copied to clipboard!');
    }
  };

  const formattedDate = new Date(createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <Link to={`/article/${slug}`} className="card" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      padding: 0,
      position: 'relative'
    }}>
      {/* Category Badge */}
      <span style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        zIndex: 2,
        background: type === 'Magazine' ? 'var(--accent-gold)' : 'var(--primary)',
        color: type === 'Magazine' ? '#1e293b' : 'white',
        fontSize: '0.7rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        padding: '0.2rem 0.5rem',
        borderRadius: '4px'
      }}>
        {category}
      </span>

      {/* Card Image */}
      <div style={{
        width: '100%',
        height: '200px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <img
          src={bannerImage}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform var(--transition-normal)'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1.0)'}
        />
        {/* Type indicator (News vs Magazine) */}
        <span style={{
          position: 'absolute',
          bottom: '0.5rem',
          right: '0.5rem',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          color: '#e2e8f0',
          fontSize: '0.65rem',
          fontWeight: 600,
          padding: '0.15rem 0.4rem',
          borderRadius: '3px'
        }}>
          {type}
        </span>
      </div>

      {/* Card Content */}
      <div style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1
      }}>
        {/* Title */}
        <h3 style={{
          fontSize: '1.2rem',
          fontWeight: 700,
          lineHeight: 1.3,
          marginBottom: '0.5rem',
          color: 'white',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          fontFamily: type === 'Magazine' ? 'var(--font-serif)' : 'var(--font-sans)'
        }}>
          {title}
        </h3>

        {/* Summary */}
        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          marginBottom: '1.25rem',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flexGrow: 1
        }}>
          {summary}
        </p>

        {/* Footer Meta Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '0.75rem',
          marginTop: 'auto'
        }}>
          {/* Author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img
              src={author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80'}
              alt={author?.name}
              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0' }}>
                {author?.name || 'Writer'}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Stats & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem' }} title="Views">
              <Eye size={12} />
              {views}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem' }} title="Read Time">
              <Clock size={12} />
              {readTime}m
            </span>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <button
                onClick={handleBookmarkClick}
                style={{
                  cursor: 'pointer',
                  padding: '0.2rem',
                  color: isBookmarked ? 'var(--primary)' : 'var(--text-dim)',
                  display: 'flex'
                }}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
              >
                <Bookmark size={14} fill={isBookmarked ? 'var(--primary)' : 'none'} />
              </button>
              <button
                onClick={handleShareClick}
                style={{ cursor: 'pointer', padding: '0.2rem', color: 'var(--text-dim)', display: 'flex' }}
                title="Share"
              >
                <Share2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
