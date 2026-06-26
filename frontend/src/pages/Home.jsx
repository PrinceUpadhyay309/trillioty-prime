import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import NewsTicker from '../components/NewsTicker';
import ArticleCard from '../components/ArticleCard';
import { ArrowRight, BookOpen, Layers, Newspaper } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user, loadUser } = useContext(AuthContext);
  const location = useLocation();

  const [articles, setArticles] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [category, setCategory] = useState('');
  const [activeTab, setActiveTab] = useState('News'); // Default: News Wire
  const [loading, setLoading] = useState(true);

  // Read search query from URL parameter
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    fetchArticles();
  }, [category, activeTab, searchQuery]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      let url = `/articles?type=${activeTab}&limit=12`;
      if (category) url += `&category=${category}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

      const res = await api.get(url);
      if (res.data.success) {
        setArticles(res.data.data);

        // Fetch featured article if on "All Categories" and "Magazine" tab
        if (!category && !searchQuery && activeTab === 'Magazine') {
          const featuredRes = await api.get('/articles?type=Magazine&limit=1&isFeatured=true');
          if (featuredRes.data.success && featuredRes.data.data.length > 0) {
            setFeatured(featuredRes.data.data[0]);
          } else {
            setFeatured(res.data.data[0] || null);
          }
        } else {
          setFeatured(null);
        }
      }
    } catch (err) {
      console.error('Failed to load articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = async (articleId) => {
    if (!user) {
      alert('Please log in to bookmark articles!');
      return;
    }
    try {
      const res = await api.post(`/articles/${articleId}/bookmark`);
      if (res.data.success) {
        // Refresh user context to sync bookmarks
        loadUser();
      }
    } catch (err) {
      console.error('Bookmark toggle failed:', err);
    }
  };

  const categories = ['Tech', 'Politics', 'Business', 'Culture', 'Sports', 'National'];

  return (
    <div>
      {/* Breaking News Ticker */}
      <NewsTicker />

      <div className="container" style={{ paddingBottom: '3rem' }}>
        {/* Banner / Hero for Featured Magazine */}
        {activeTab === 'Magazine' && featured && !category && !searchQuery && (
          <div className="card" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            padding: '2rem',
            background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-hover) 100%)',
            border: '1px solid var(--border-color)',
            marginBottom: '2.5rem',
            overflow: 'hidden'
          }}>
            {/* Hero Image */}
            <div style={{ height: '350px', borderRadius: '8px', overflow: 'hidden' }}>
              <img
                src={featured.bannerImage}
                alt={featured.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            {/* Hero Info */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{
                background: 'var(--accent-gold)',
                color: '#111827',
                alignSelf: 'flex-start',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                marginBottom: '1rem',
                textTransform: 'uppercase'
              }}>
                Editor's Choice
              </span>
              <h1 style={{
                fontSize: '2rem',
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                color: 'var(--text-main)',
                lineHeight: 1.25,
                marginBottom: '1rem'
              }}>
                {featured.title}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                {featured.summary}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <img
                  src={featured.author?.avatar}
                  alt={featured.author?.name}
                  style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                />
                <div>
                  <h4 style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600 }}>{featured.author?.name}</h4>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                    {new Date(featured.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <Link to={`/article/${featured.slug}`} className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                <span>Read Feature</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}

        {/* Section Header Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '1rem',
          marginBottom: '2rem'
        }}>
          {/* Tab selectors */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => { setActiveTab('News'); setCategory(''); }}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1.25rem',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: activeTab === 'News' ? 'white' : 'var(--text-muted)',
                background: activeTab === 'News' ? 'var(--primary)' : 'rgba(0, 0, 0, 0.03)',
                transition: 'var(--transition-fast)'
              }}
            >
              <Newspaper size={16} />
              <span>Agency Wire</span>
            </button>
            <button
              onClick={() => { setActiveTab('Magazine'); setCategory(''); }}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1.25rem',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: activeTab === 'Magazine' ? '#111827' : 'var(--text-muted)',
                background: activeTab === 'Magazine' ? 'var(--accent-gold)' : 'rgba(0, 0, 0, 0.03)',
                transition: 'var(--transition-fast)'
              }}
            >
              <BookOpen size={16} style={{ color: activeTab === 'Magazine' ? '#111827' : 'inherit' }} />
              <span style={{ color: activeTab === 'Magazine' ? '#111827' : 'inherit' }}>Prime Magazine</span>
            </button>
          </div>

          {/* Categories Pill Filters */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setCategory('')}
              style={{
                cursor: 'pointer',
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 500,
                background: category === '' ? 'rgba(0,0,0,0.06)' : 'transparent',
                border: '1px solid rgba(0,0,0,0.08)',
                color: category === '' ? 'var(--text-main)' : 'var(--text-muted)'
              }}
            >
              All Topics
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  cursor: 'pointer',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  background: category === cat ? 'rgba(0,0,0,0.06)' : 'transparent',
                  border: '1px solid rgba(0,0,0,0.08)',
                  color: category === cat ? 'var(--text-main)' : 'var(--text-muted)',
                  transition: 'var(--transition-fast)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Display Search Results Header */}
        {searchQuery && (
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
            Showing results for "<span style={{ color: 'white' }}>{searchQuery}</span>" in {activeTab === 'News' ? 'Agency Wire' : 'Prime Magazine'}
          </h2>
        )}

        {/* Main Grid display */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
            Loading feeds...
          </div>
        ) : (
          <>
            {articles.length > 0 ? (
              <div className="grid-three">
                {/* Skip first element in Magazine view if hero banner is already displaying it */}
                {articles
                  .filter((a) => !(activeTab === 'Magazine' && featured && a._id === featured._id))
                  .map((article) => {
                    const isBookmarked = user?.bookmarks?.some(
                      (b) => b._id === article._id || b === article._id
                    );
                    return (
                      <ArticleCard
                        key={article._id}
                        article={article}
                        isBookmarked={isBookmarked}
                        onBookmarkToggle={handleBookmarkToggle}
                      />
                    );
                  })}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '4rem 0',
                border: '1px dashed var(--border-color)',
                borderRadius: '12px',
                color: 'var(--text-dim)'
              }}>
                <Layers size={36} style={{ marginBottom: '1rem' }} />
                <p>No feeds found for this category.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
