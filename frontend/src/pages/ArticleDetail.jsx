import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import CommentSection from '../components/CommentSection';
import { Calendar, Eye, Clock, Share2, Award, ArrowLeft, Bookmark } from 'lucide-react';

const ArticleDetail = () => {
  const { slug } = useParams();
  const { user, loadUser } = useContext(AuthContext);

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    fetchArticleDetails();
    
    // Add scroll progress listener
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [slug]);

  const fetchArticleDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/articles/post/${slug}`);
      if (res.data.success) {
        setArticle(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load article:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const progress = (window.pageYOffset / totalHeight) * 100;
      setScrollProgress(progress);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!user) {
      alert('Please log in to bookmark articles!');
      return;
    }
    try {
      const res = await api.post(`/articles/${article._id}/bookmark`);
      if (res.data.success) {
        loadUser(); // Refresh bookmarks list
      }
    } catch (err) {
      console.error('Bookmark toggle failed:', err);
    }
  };

  const handleSocialShare = (platform) => {
    const shareUrl = window.location.href;
    const shareText = `Read "${article.title}" on Trillioty Prime:`;
    
    let url = '';
    if (platform === 'whatsapp') {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    } else if (platform === 'telegram') {
      url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    } else if (platform === 'twitter') {
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>Loading article...</div>;
  }

  if (!article) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <h2>Article Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>The article you are looking for does not exist or has been removed.</p>
        <Link to="/" className="btn-primary">
          <ArrowLeft size={16} />
          <span>Back to Wire</span>
        </Link>
      </div>
    );
  }

  const isBookmarked = user?.bookmarks?.some(
    (b) => b._id === article._id || b === article._id
  );

  const formattedDate = new Date(article.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div style={{ position: 'relative', paddingBottom: '4rem' }}>
      {/* Scroll Progress Bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: `${scrollProgress}%`,
        height: '4px',
        backgroundColor: 'var(--primary)',
        boxShadow: 'var(--shadow-glow)',
        zIndex: 999,
        transition: 'width 0.1s ease'
      }}></div>

      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Back Link */}
        <Link to="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
          marginBottom: '2rem'
        }} className="nav-link-hover">
          <ArrowLeft size={16} />
          <span>Back to Wire</span>
        </Link>

        {/* Article Meta Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span style={{
            background: article.type === 'Magazine' ? 'var(--accent-gold)' : 'var(--primary)',
            color: article.type === 'Magazine' ? '#1e293b' : 'white',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            padding: '0.2rem 0.6rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            display: 'inline-block'
          }}>
            {article.category}
          </span>

          <h1 style={{
            fontSize: '2.5rem',
            fontFamily: article.type === 'Magazine' ? 'var(--font-serif)' : 'var(--font-sans)',
            fontWeight: 800,
            lineHeight: 1.2,
            color: 'var(--text-main)',
            marginBottom: '1.5rem'
          }}>
            {article.title}
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            marginBottom: '2rem',
            borderLeft: '3px solid var(--primary)',
            paddingLeft: '1rem'
          }}>
            {article.summary}
          </p>

          {/* Author Details Block */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            borderTop: '1px solid var(--border-color)',
            borderBottom: '1px solid var(--border-color)',
            padding: '1rem 0'
          }}>
            {/* Left side author */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img
                src={article.author?.avatar}
                alt={article.author?.name}
                style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 600 }}>{article.author?.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent-gold)' }}>
                    <Award size={12} />
                    {article.author?.reputation || 0} Rep
                  </span>
                  <span>•</span>
                  <span>{article.author?.role}</span>
                </div>
              </div>
            </div>

            {/* Right side stats */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} />
                {formattedDate}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} />
                {article.readTime} min read
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Eye size={14} />
                {article.views} views
              </span>
            </div>
          </div>
        </div>

        {/* Banner Image */}
        <div style={{ width: '100%', height: '400px', borderRadius: '12px', overflow: 'hidden', marginBottom: '2.5rem' }}>
          <img
            src={article.bannerImage}
            alt={article.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Article Body Content */}
        <article className="article-body" dangerouslySetInnerHTML={{ __html: article.content }} />

        {/* Share & Bookmark Actions Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '3rem',
          borderTop: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)',
          padding: '1rem 0'
        }}>
          {/* Share buttons (WhatsApp focused for Indian audience) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginRight: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Share2 size={14} /> Share:
            </span>
            <button
              onClick={() => handleSocialShare('whatsapp')}
              style={{
                cursor: 'pointer',
                background: '#25D366',
                color: 'white',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              WhatsApp
            </button>
            <button
              onClick={() => handleSocialShare('telegram')}
              style={{
                cursor: 'pointer',
                background: '#0088cc',
                color: 'white',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              Telegram
            </button>
            <button
              onClick={() => handleSocialShare('twitter')}
              style={{
                cursor: 'pointer',
                background: '#1DA1F2',
                color: 'white',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              X
            </button>
          </div>

          {/* Bookmark toggle */}
          <button
            onClick={handleBookmarkToggle}
            className="btn-secondary"
            style={{
              padding: '0.5rem 1rem',
              height: '38px',
              fontSize: '0.85rem',
              color: isBookmarked ? 'var(--primary)' : 'inherit',
              borderColor: isBookmarked ? 'rgba(220, 38, 38, 0.3)' : 'var(--border-color)'
            }}
          >
            <Bookmark size={14} fill={isBookmarked ? 'var(--primary)' : 'none'} />
            <span>{isBookmarked ? 'Bookmarked' : 'Save Article'}</span>
          </button>
        </div>

        {/* Comments Section */}
        <CommentSection articleId={article._id} />
      </div>
    </div>
  );
};

export default ArticleDetail;
