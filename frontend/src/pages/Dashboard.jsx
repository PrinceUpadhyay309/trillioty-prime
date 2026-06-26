import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { FileText, Eye, Award, Plus, Layers, Trash2, Edit3, ShieldAlert, ArrowLeft } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWriteForm, setShowWriteForm] = useState(false);

  // New Article Form state
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    bannerImage: '',
    type: 'News',
    category: 'Tech',
    tags: '',
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    // Auth Guard: Only Admin, Editor, Author can access the dashboard
    if (user && !['Admin', 'Editor', 'Author'].includes(user.role)) {
      navigate('/');
    } else if (!user) {
      navigate('/login');
    } else {
      fetchMyArticles();
    }
  }, [user, navigate]);

  const fetchMyArticles = async () => {
    setLoading(true);
    try {
      // Query articles. Standard API gets all, but we can filter client-side or use author query
      const res = await api.get('/articles?limit=100');
      if (res.data.success) {
        // Filter articles authored by the current logged-in user (unless Admin/Editor, who can see all)
        const myArticles = ['Admin', 'Editor'].includes(user.role)
          ? res.data.data
          : res.data.data.filter((art) => art.author?._id === user.id);
        setArticles(myArticles);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormSuccess(false);

    try {
      const tagsArray = formData.tags
        ? formData.tags.split(',').map((t) => t.trim())
        : [];
      
      const payload = {
        ...formData,
        tags: tagsArray,
      };

      // Set placeholder banner image if none provided
      if (!payload.bannerImage.trim()) {
        payload.bannerImage = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80';
      }

      const res = await api.post('/articles', payload);
      if (res.data.success) {
        setArticles((prev) => [res.data.data, ...prev]);
        setFormSuccess(true);
        // Clear form
        setFormData({
          title: '',
          summary: '',
          content: '',
          bannerImage: '',
          type: 'News',
          category: 'Tech',
          tags: '',
        });
        // Delay closing form view
        setTimeout(() => {
          setShowWriteForm(false);
          setFormSuccess(false);
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to publish article:', err);
      alert(err.response?.data?.message || 'Failed to publish article.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteArticle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      const res = await api.delete(`/articles/${id}`);
      if (res.data.success) {
        setArticles((prev) => prev.filter((a) => a._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete article:', err);
    }
  };

  // Compute analytics metrics
  const totalArticles = articles.length;
  const totalViews = articles.reduce((sum, art) => sum + (art.views || 0), 0);
  const reputation = user?.reputation || 0;

  const categories = ['Tech', 'Politics', 'Business', 'Culture', 'Sports', 'National'];

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      {/* Dashboard Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Publisher Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Logged in as <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{user?.name}</span> ({user?.role})
          </p>
        </div>
        <button
          onClick={() => setShowWriteForm(!showWriteForm)}
          className={showWriteForm ? 'btn-secondary' : 'btn-primary'}
          style={{ height: '40px' }}
        >
          {showWriteForm ? (
            <>
              <ArrowLeft size={16} />
              <span>Back to Studio</span>
            </>
          ) : (
            <>
              <Plus size={16} />
              <span>Create Article</span>
            </>
          )}
        </button>
      </div>

      {showWriteForm ? (
        /* Create Article Form */
        <div className="card glass" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.5rem' }}>
            Draft a New Article
          </h2>
          {formSuccess && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              color: 'var(--accent-emerald)',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              fontWeight: 600
            }}>
              Article published successfully! Returning to dashboard...
            </div>
          )}
          <form onSubmit={handleCreateArticle} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Article Type</label>
                <select
                  name="type"
                  className="input-field"
                  value={formData.type}
                  onChange={handleInputChange}
                  style={{ background: '#ffffff', color: 'var(--text-main)', cursor: 'pointer' }}
                >
                  <option value="News" style={{ background: 'var(--bg-card)' }}>News (Short and Breaking)</option>
                  <option value="Magazine" style={{ background: 'var(--bg-card)' }}>Magazine (Long-form Editorial)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Category</label>
                <select
                  name="category"
                  className="input-field"
                  value={formData.category}
                  onChange={handleInputChange}
                  style={{ background: '#ffffff', color: 'var(--text-main)', cursor: 'pointer' }}
                >
                  {categories.map((c) => (
                    <option key={c} value={c} style={{ background: 'var(--bg-card)' }}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Title</label>
              <input
                type="text"
                name="title"
                placeholder="Enter an attention-grabbing headline..."
                className="input-field"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Summary / Snippet</label>
              <input
                type="text"
                name="summary"
                placeholder="Short description for preview cards..."
                className="input-field"
                value={formData.summary}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Banner Image URL</label>
              <input
                type="text"
                name="bannerImage"
                placeholder="https://images.unsplash.com/... (optional)"
                className="input-field"
                value={formData.bannerImage}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                placeholder="e.g. technology, space, business, mumbai"
                className="input-field"
                value={formData.tags}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Article Content (HTML allowed)</label>
              <textarea
                name="content"
                placeholder="Write your article body. You can use standard HTML tags like <p>, <h3>, <blockquote>, <strong>..."
                className="input-field"
                value={formData.content}
                onChange={handleInputChange}
                style={{ minHeight: '220px', resize: 'vertical', fontFamily: 'var(--font-sans)', fontSize: '0.9rem' }}
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-end', height: '42px' }} disabled={formLoading}>
              {formLoading ? 'Publishing...' : 'Publish Article'}
            </button>
          </form>
        </div>
      ) : (
        /* Dashboard Analytics & User Articles List */
        <div>
          {/* Analytics Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem'
          }}>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
              <div style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '0.75rem', borderRadius: '8px' }}>
                <FileText size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Articles Published</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>{totalArticles}</h3>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
              <div style={{ background: 'rgba(251, 191, 36, 0.1)', color: 'var(--accent-gold)', padding: '0.75rem', borderRadius: '8px' }}>
                <Eye size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Accumulated Views</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>{totalViews}</h3>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', padding: '0.75rem', borderRadius: '8px' }}>
                <Award size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Author Reputation</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>{reputation}</h3>
              </div>
            </div>
          </div>

          {/* List of articles */}
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
            My Publications
          </h2>
          {loading ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading posts database...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {articles.length > 0 ? (
                articles.map((art) => (
                  <div
                    key={art._id}
                    className="card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      padding: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                      <img
                        src={art.bannerImage}
                        alt={art.title}
                        style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <Link to={`/article/${art.slug}`}>
                          <h4 style={{
                            color: 'var(--text-main)',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            textDecoration: 'underline'
                          }}>
                            {art.title}
                          </h4>
                        </Link>
                        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                          <span>{art.category}</span>
                          <span>•</span>
                          <span>{art.type}</span>
                          <span>•</span>
                          <span>{art.views || 0} views</span>
                        </div>
                      </div>
                    </div>
                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleDeleteArticle(art._id)}
                        style={{
                          cursor: 'pointer',
                          color: 'var(--accent-rose)',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(244, 63, 94, 0.2)',
                          display: 'flex'
                        }}
                        title="Delete publication"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem 0',
                  border: '1px dashed var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-dim)'
                }}>
                  <Layers size={24} style={{ marginBottom: '0.5rem' }} />
                  <p>You haven't written any articles yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
