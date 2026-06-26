import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import CommentSection from '../components/CommentSection';
import {
  Heart,
  MessageCircle,
  Share2,
  Award,
  Calendar,
  Image,
  BarChart2,
  Smile,
  Tag,
  Trash2,
  Send,
  AlertCircle,
  Flame,
  TrendingUp,
  Video,
  Plus,
  Edit2,
  Check,
  X,
  Repeat2,
  Users,
  MessageSquare,
  Paperclip
} from 'lucide-react';

const CharchaForum = () => {
  const { user, loadUser } = useContext(AuthContext);

  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedPostId, setExpandedPostId] = useState(null);

  // Tab state: 'timeline' or 'chat'
  const [activeTab, setActiveTab] = useState('timeline');

  // Hype Leaderboard state
  const [leaderboard, setLeaderboard] = useState([]);

  // Chat Lobby state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  // Direct Message (DM) state
  const [contacts, setContacts] = useState([]);
  const [selectedChat, setSelectedChat] = useState('lobby'); // 'lobby' or contact user object
  const [dmMessages, setDmMessages] = useState([]);
  const [dmInput, setDmInput] = useState('');

  // Compose Box state & Ref
  const composeEditorRef = useRef(null);
  const composeFileInputRef = useRef(null);
  const [attachedMedia, setAttachedMedia] = useState('');
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'General',
  });

  const [selectedProfileUser, setSelectedProfileUser] = useState(null);

  // Chat Input attachment state
  const chatFileInputRef = useRef(null);
  const [chatAttachedMedia, setChatAttachedMedia] = useState('');

  // Profile Edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedHeadline, setEditedHeadline] = useState('');
  const [editedBio, setEditedBio] = useState('');

  // Fetch timeline feed & leaderboard
  useEffect(() => {
    fetchPosts();
    fetchLeaderboard();
  }, [category, sortBy, search]);

  // Sync profile details
  useEffect(() => {
    if (user) {
      setEditedHeadline(user.headline || '');
      setEditedBio(user.bio || '');
      fetchContacts();
    }
  }, [user]);

  // Handle DM messages fetch when selectedChat changes
  useEffect(() => {
    if (activeTab === 'chat' && selectedChat !== 'lobby') {
      fetchDmMessages();
    }
  }, [selectedChat, activeTab]);

  // Handle auto polling for chat room (both public lobby & DMs)
  useEffect(() => {
    let interval;
    if (activeTab === 'chat') {
      if (selectedChat === 'lobby') {
        fetchChatMessages();
        interval = setInterval(fetchChatMessages, 4000);
      } else {
        fetchDmMessages();
        interval = setInterval(fetchDmMessages, 4000);
      }
      fetchContacts();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, selectedChat]);

  // Auto-scroll chat on message updates
  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [chatMessages, dmMessages, activeTab]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let url = `/forums?sort=${sortBy}`;
      if (category) url += `&category=${category}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      if (res.data.success) {
        setPosts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load forum posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/forums?sort=hype&limit=3');
      if (res.data.success) {
        setLeaderboard(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    }
  };

  const fetchChatMessages = async () => {
    try {
      const res = await api.get('/chat');
      if (res.data.success) {
        setChatMessages(res.data.data);
      }
    } catch (err) {
      console.error('Chat messages load error:', err);
    }
  };

  const fetchContacts = async () => {
    if (!user) return;
    try {
      const res = await api.get('/dm');
      if (res.data.success) {
        setContacts(res.data.data);
      }
    } catch (err) {
      console.error('DM contacts fetch error:', err);
    }
  };

  const fetchDmMessages = async () => {
    if (selectedChat === 'lobby' || !selectedChat) return;
    try {
      const res = await api.get(`/dm/${selectedChat._id}`);
      if (res.data.success) {
        setDmMessages(res.data.data);
      }
    } catch (err) {
      console.error('DM history fetch error:', err);
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() && !chatAttachedMedia) return;

    try {
      const res = await api.post('/chat', { message: chatInput, media: chatAttachedMedia || undefined });
      if (res.data.success) {
        setChatMessages((prev) => [...prev, res.data.data]);
        setChatInput('');
        setChatAttachedMedia('');
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.error('Failed to send chat message:', err);
    }
  };

  const handleSendDm = async (e) => {
    e.preventDefault();
    if (!dmInput.trim() && !chatAttachedMedia) return;

    try {
      const res = await api.post(`/dm/${selectedChat._id}`, { message: dmInput, media: chatAttachedMedia || undefined });
      if (res.data.success) {
        setDmMessages((prev) => [...prev, res.data.data]);
        setDmInput('');
        setChatAttachedMedia('');
        setTimeout(scrollToBottom, 100);
        fetchContacts();
      }
    } catch (err) {
      console.error('Failed to send Direct Message:', err);
    }
  };

  const handleStartDm = (e, author) => {
    e.stopPropagation();
    if (!user) {
      alert('Please log in to message authors!');
      return;
    }
    if (author._id === user.id) {
      alert('You cannot start a chat conversation with yourself!');
      return;
    }
    
    // Add to local contacts if not present
    const exists = contacts.find((c) => c._id === author._id);
    if (!exists) {
      setContacts((prev) => [author, ...prev]);
    }
    
    setSelectedChat(author);
    setActiveTab('chat');
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleVote = async (e, id, type) => {
    e.stopPropagation();
    if (!user) {
      alert('Please log in to vote!');
      return;
    }
    try {
      const res = await api.post(`/forums/${id}/${type}`);
      if (res.data.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === id
              ? { ...p, upvotes: res.data.upvotes, downvotes: res.data.downvotes }
              : p
          )
        );
      }
    } catch (err) {
      console.error('Voting failed:', err);
    }
  };

  const handleHype = async (e, id) => {
    e.stopPropagation();
    if (!user) {
      alert('Please log in to Hype posts!');
      return;
    }
    try {
      const res = await api.post(`/forums/${id}/hype`);
      if (res.data.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === id
              ? { ...p, hypeCount: res.data.hypeCount }
              : p
          )
        );
        if (loadUser) await loadUser();
        fetchLeaderboard();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Hype failed');
    }
  };

  const handleRepost = async (e, id) => {
    e.stopPropagation();
    if (!user) {
      alert('Please log in to repost!');
      return;
    }
    try {
      const res = await api.post(`/forums/${id}/repost`);
      if (res.data.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === id
              ? { ...p, reposts: res.data.reposts }
              : p
          )
        );
      }
    } catch (err) {
      console.error('Repost failed:', err);
    }
  };

  const handleFollowToggle = async (e, authorId) => {
    e.stopPropagation();
    if (!user) {
      alert('Please log in to follow citizen journalists!');
      return;
    }
    try {
      const res = await api.post(`/auth/follow/${authorId}`);
      if (res.data.success) {
        if (loadUser) await loadUser();
        fetchPosts();
      }
    } catch (err) {
      console.error('Follow failed:', err);
    }
  };

  const handleOpenUserProfile = async (userId) => {
    if (!userId) return;
    try {
      const res = await api.get(`/auth/user/${userId}`);
      if (res.data.success) {
        setSelectedProfileUser(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
    }
  };

  const handleModalFollowToggle = async (e, authorId) => {
    e.stopPropagation();
    if (!user) {
      alert('Please log in to follow citizen journalists!');
      return;
    }
    try {
      const res = await api.post(`/auth/follow/${authorId}`);
      if (res.data.success) {
        if (loadUser) await loadUser();
        fetchPosts();
        setSelectedProfileUser(prev => {
          if (!prev) return null;
          let newFollowers = [...(prev.followers || [])];
          const index = newFollowers.indexOf(user.id);
          if (index > -1) {
            newFollowers.splice(index, 1);
          } else {
            newFollowers.push(user.id);
          }
          return {
            ...prev,
            followers: newFollowers,
            reputation: res.data.reputation
          };
        });
      }
    } catch (err) {
      console.error('Follow failed:', err);
    }
  };

  const handleModalStartDm = (e, targetUser) => {
    e.stopPropagation();
    setSelectedProfileUser(null);
    handleStartDm(e, targetUser);
  };

  const handleSaveProfile = async () => {
    try {
      const res = await api.put('/auth/profile', {
        headline: editedHeadline,
        bio: editedBio,
      });
      if (res.data.success) {
        setIsEditingProfile(false);
        if (loadUser) await loadUser();
      }
    } catch (err) {
      console.error('Profile update failed:', err);
    }
  };

  // Helper to get raw text length ignoring HTML tags
  const getRawTextLength = (htmlString) => {
    if (!htmlString) return 0;
    const clean = htmlString.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
    return clean.replace(/\r?\n/g, '').trim().length;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const rawLen = getRawTextLength(newPost.content);
    if (rawLen === 0) return;
    if (rawLen > 280) {
      alert('Post content cannot exceed 280 characters!');
      return;
    }

    try {
      const res = await api.post('/forums', { ...newPost, media: attachedMedia || undefined });
      if (res.data.success) {
        setPosts((prev) => [res.data.data, ...prev]);
        setNewPost({ title: '', content: '', category: 'General' });
        if (composeEditorRef.current) {
          composeEditorRef.current.innerHTML = '';
        }
        setAttachedMedia('');
      }
    } catch (err) {
      console.error('Create thread failed:', err);
    }
  };

  const handleDeletePost = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this thread?')) return;
    try {
      const res = await api.delete(`/forums/${id}`);
      if (res.data.success) {
        setPosts((prev) => prev.filter((p) => p._id !== id));
        if (expandedPostId === id) setExpandedPostId(null);
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const handleShareClick = (e, post) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/charcha?post=${post._id}`;
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content,
        url: shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Charcha post link copied to clipboard!');
    }
  };

  const handleHashtagClick = (tag) => {
    setSearch(tag);
    setCategory('');
  };

  // Base64 File upload convert triggers
  const handleComposeFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedMedia(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleChatFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setChatAttachedMedia(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // WYSIWYG Editor input handler
  const handleEditorInput = (e) => {
    setNewPost((prev) => ({ ...prev, content: e.target.innerHTML }));
  };

  // Rich Text WYSIWYG editor format application wrappers
  const applyFormat = (command, value = null) => {
    if (composeEditorRef.current) {
      composeEditorRef.current.focus();
    }
    
    if (command === 'createLink') {
      const url = prompt('Enter URL (e.g. https://google.com):');
      if (url) {
        document.execCommand(command, false, url);
      }
    } else {
      document.execCommand(command, false, value);
    }
    
    if (composeEditorRef.current) {
      setNewPost((prev) => ({ ...prev, content: composeEditorRef.current.innerHTML }));
    }
  };

  // Parsing hashtags dynamically inside blocks
  const renderContentWithHashtags = (content) => {
    if (!content) return '';
    const regex = /(#[a-zA-Z0-9_\u0900-\u097F]+)/g;
    const parts = content.split(regex);
    return parts.map((part, index) => {
      if (part.match(regex)) {
        return (
          <span
            key={index}
            className="charcha-hashtag"
            onClick={(e) => {
              e.stopPropagation();
              handleHashtagClick(part);
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // HTML safe formatting parser
  const parseRichText = (text) => {
    if (!text) return '';
    let formatted = text;

    formatted = formatted.replace(/<h3>(.*?)<\/h3>/gi, '###H3###$1###/H3###');
    formatted = formatted.replace(/<blockquote>(.*?)<\/blockquote>/gi, '###Q###$1###/Q###');
    formatted = formatted.replace(/<strong>(.*?)<\/strong>/gi, '###B###$1###/B###');
    formatted = formatted.replace(/<b>(.*?)<\/b>/gi, '###B###$1###/B###');
    formatted = formatted.replace(/<em>(.*?)<\/em>/gi, '###I###$1###/I###');
    formatted = formatted.replace(/<i>(.*?)<\/i>/gi, '###I###$1###/I###');
    formatted = formatted.replace(/<a\s+href=["'](.*?)["']\s*[^>]*>(.*?)<\/a>/gi, '###L###$2|SEC|$1###/L###');

    // Also support fallback markdown tags
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '###B###$1###/B###');
    formatted = formatted.replace(/\*(.*?)\*/g, '###I###$1###/I###');
    formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '###L###$1|SEC|$2###/L###');

    const parts = formatted.split(/(###.*?###)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('###H3###') && part.endsWith('###/H3###')) {
        const inner = part.substring(8, part.length - 10);
        return <h3 key={idx} style={{ fontSize: '1.1rem', margin: '0.5rem 0', fontWeight: 'bold' }}>{inner}</h3>;
      }
      if (part.startsWith('###Q###') && part.endsWith('###/Q###')) {
        const inner = part.substring(7, part.length - 9);
        return <blockquote key={idx} style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '0.75rem', margin: '0.5rem 0', fontStyle: 'italic', color: 'var(--text-muted)' }}>{inner}</blockquote>;
      }
      if (part.startsWith('###B###') && part.endsWith('###/B###')) {
        const inner = part.substring(7, part.length - 9);
        return <strong key={idx}>{inner}</strong>;
      }
      if (part.startsWith('###I###') && part.endsWith('###/I###')) {
        const inner = part.substring(7, part.length - 9);
        return <em key={idx}>{inner}</em>;
      }
      if (part.startsWith('###L###') && part.endsWith('###/L###')) {
        const inner = part.substring(7, part.length - 9);
        const [label, url] = inner.split('|SEC|');
        return <a key={idx} href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{label}</a>;
      }
      const cleanText = part.replace(/<[^>]*>/g, '');
      return renderContentWithHashtags(cleanText);
    });
  };

  const getYoutubeEmbedUrl = (content) => {
    if (!content) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const words = content.split(/\s+/);
    for (let word of words) {
      const match = word.match(regExp);
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
      }
    }
    return null;
  };

  const renderMedia = (mediaString) => {
    if (!mediaString) return null;
    const isImage = mediaString.startsWith('data:image/') || mediaString.match(/\.(jpeg|jpg|gif|png|webp)/i);
    const isVideo = mediaString.startsWith('data:video/') || mediaString.match(/\.(mp4|webm|ogg)/i);

    if (isImage) {
      return (
        <div style={{ marginTop: '0.75rem', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)', maxWidth: '100%' }}>
          <img src={mediaString} alt="Media Attachment" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
      );
    }
    if (isVideo) {
      return (
        <div style={{ marginTop: '0.75rem', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)', maxWidth: '100%', background: '#000' }}>
          <video src={mediaString} controls style={{ width: '100%', display: 'block' }} />
        </div>
      );
    }
    return null;
  };

  const renderLinkPreview = (content) => {
    if (!content) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = content.match(urlRegex);
    if (!urls || urls.length === 0) return null;
    const nonYoutubeUrls = urls.filter(url => {
      return !url.includes('youtube.com') && !url.includes('youtu.be');
    });
    if (nonYoutubeUrls.length === 0) return null;
    const targetUrl = nonYoutubeUrls[0];
    let hostname = 'External Link';
    try {
      hostname = new URL(targetUrl).hostname;
    } catch {}
    return (
      <a
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="link-preview-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginTop: '0.75rem',
          padding: '0.75rem 1rem',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          textDecoration: 'none',
          color: 'var(--text-main)',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '6px',
          background: 'var(--bg-app)',
          color: 'var(--primary)',
          flexShrink: 0
        }}>
          <Paperclip size={18} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', overflow: 'hidden', textAlign: 'left' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{hostname}</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>{targetUrl}</span>
        </div>
      </a>
    );
  };

  const getReputationBadge = (rep) => {
    if (rep >= 100) return { label: 'Gold Anchor', color: '#fbbf24' };
    if (rep >= 50) return { label: 'Silver Editor', color: '#94a3b8' };
    if (rep >= 20) return { label: 'Bronze Reporter', color: '#b45309' };
    return { label: 'Citizen Contributor', color: 'var(--text-dim)' };
  };

  const categories = ['Tech', 'Politics', 'Business', 'Culture', 'Sports', 'National', 'General'];
  const trendingTopics = ['#Elections2026', '#Budget2026', '#TechPolicy', '#CitizenJournalism', '#DigitalIndia', '#StartupIndia'];

  // Circular progress calculations for character counter
  const characterLimit = 280;
  const charsUsed = getRawTextLength(newPost.content);
  const percentage = Math.min(charsUsed / characterLimit, 1);
  const circumference = 2 * Math.PI * 10; // 62.83
  const strokeDashoffset = circumference - percentage * circumference;
  const progressColor = charsUsed > characterLimit * 0.9 ? 'var(--accent-rose)' : 'var(--primary)';

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <div className="charcha-layout">
        
        {/* ==========================================================
           LEFT SIDEBAR: LINKEDIN PROFESSIONAL CARD
           ========================================================== */}
        <div className="charcha-sidebar-left">
          {user ? (
            <div className="charcha-sidebar-card" style={{ padding: '1.25rem 1.1rem' }}>
              <div className="charcha-profile-header"></div>
              
              <div className="charcha-profile-avatar-container">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="charcha-profile-avatar"
                />
              </div>

              <div style={{ marginTop: '0.25rem' }}>
                <h3 className="charcha-profile-name">{user.name}</h3>
                
                {isEditingProfile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.75rem' }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Professional headline..."
                      value={editedHeadline}
                      onChange={(e) => setEditedHeadline(e.target.value)}
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', height: '30px' }}
                    />
                    <textarea
                      className="input-field"
                      placeholder="Short professional biography..."
                      value={editedBio}
                      onChange={(e) => setEditedBio(e.target.value)}
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', minHeight: '50px', resize: 'none' }}
                    />
                    <div style={{ display: 'flex', gap: '0.25rem', alignSelf: 'flex-end', marginTop: '0.25rem' }}>
                      <button
                        onClick={handleSaveProfile}
                        className="btn-primary"
                        style={{ padding: '0.2rem 0.4rem', borderRadius: '4px', height: '24px', fontSize: '0.65rem' }}
                      >
                        <Check size={10} />
                      </button>
                      <button
                        onClick={() => setIsEditingProfile(false)}
                        className="btn-secondary"
                        style={{ padding: '0.2rem 0.4rem', borderRadius: '4px', height: '24px', fontSize: '0.65rem' }}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="charcha-profile-headline">{user.headline || 'Citizen Journalist'}</p>
                    <p style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      textAlign: 'center',
                      fontStyle: 'italic',
                      lineHeight: 1.35,
                      marginBottom: '1rem'
                    }}>
                      "{user.bio || 'Passionate about independent reporting.'}"
                    </p>
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        margin: '0 auto 1rem auto'
                      }}
                    >
                      <Edit2 size={10} /> Edit Profile
                    </button>
                  </>
                )}

                {/* Badge */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    background: 'var(--primary-glow)',
                    color: getReputationBadge(user.reputation).color,
                    border: '1px solid var(--primary-border)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '12px'
                  }}>
                    {getReputationBadge(user.reputation).label}
                  </span>
                </div>

                <div className="charcha-profile-stats">
                  <div className="charcha-profile-stat-row">
                    <span>Reputation:</span>
                    <span className="charcha-profile-stat-val" style={{ color: 'var(--accent-gold)' }}>
                      ★ {user.reputation || 0}
                    </span>
                  </div>
                  <div className="charcha-profile-stat-row">
                    <span>Followers:</span>
                    <span className="charcha-profile-stat-val">{user.followers?.length || 0}</span>
                  </div>
                  <div className="charcha-profile-stat-row">
                    <span>Following:</span>
                    <span className="charcha-profile-stat-val">{user.following?.length || 0}</span>
                  </div>
                  <div className="charcha-profile-stat-row">
                    <span>Weekly Hypes:</span>
                    <span className="charcha-profile-stat-val" style={{ color: 'var(--accent-orange)' }}>
                      ⚡ {user.hypesRemaining ?? 3} left
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="charcha-sidebar-card" style={{ textAlign: 'center', padding: '2rem 1.25rem' }}>
              <Users size={32} style={{ color: 'var(--text-dim)', marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Citizen Journalism</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Join the platform to customize your feed, connect with reporters, and earn reputation badges.
              </p>
            </div>
          )}
        </div>

        {/* ==========================================================
           CENTER ROW: TIMELINE FEED & LIVE CHAT ROOM
           ========================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Tabs Selector Navigation */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '0.35rem',
            marginBottom: '1rem'
          }}>
            <button
              onClick={() => setActiveTab('timeline')}
              style={{
                flex: 1,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.6rem 0',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: activeTab === 'timeline' ? 'var(--text-main)' : 'var(--text-muted)',
                background: activeTab === 'timeline' ? 'var(--pill-active-bg)' : 'transparent',
                transition: 'all var(--transition-fast)'
              }}
            >
              <TrendingUp size={15} />
              Timeline Feed
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              style={{
                flex: 1,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.6rem 0',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: activeTab === 'chat' ? 'var(--text-main)' : 'var(--text-muted)',
                background: activeTab === 'chat' ? 'var(--pill-active-bg)' : 'transparent',
                transition: 'all var(--transition-fast)'
              }}
            >
              <MessageSquare size={15} />
              Charcha Chat Room
            </button>
          </div>

          {activeTab === 'timeline' ? (
            <>
              {/* 1. Dynamic Social Media Compose Box at Top */}
              {user ? (
                <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
                  <form onSubmit={handleCreateSubmit} style={{ display: 'flex', gap: '1rem' }}>
                    <img
                      src={user.avatar}
                      alt={user.name}
                      style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {/* Category selector row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Posting in:</span>
                        <select
                          value={newPost.category}
                          onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                          style={{
                            background: 'var(--bg-main)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-main)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          {categories.map((c) => (
                            <option key={c} value={c} style={{ background: 'var(--bg-card)' }}>{c}</option>
                          ))}
                        </select>
                      </div>
                      {/* Rich Text Editor Toolbar */}
                      <div className="editor-toolbar">
                        <button type="button" className="editor-btn" onClick={() => applyFormat('bold')} style={{ fontWeight: 'bold' }}>B</button>
                        <button type="button" className="editor-btn" onClick={() => applyFormat('italic')} style={{ fontStyle: 'italic' }}>I</button>
                        <button type="button" className="editor-btn" onClick={() => applyFormat('formatBlock', 'blockquote')}>Quote</button>
                        <button type="button" className="editor-btn" onClick={() => applyFormat('formatBlock', 'h3')}>Header</button>
                        <button type="button" className="editor-btn" onClick={() => applyFormat('createLink')}>Link</button>
                      </div>

                      {/* Title input */}
                      <input
                        type="text"
                        placeholder="Add a title (optional)..."
                        value={newPost.title}
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                          borderBottom: '1px solid var(--border-color)',
                          paddingBottom: '0.4rem',
                          width: '100%'
                        }}
                      />

                      {/* Content editor (contentEditable WYSIWYG) */}
                      <div
                        ref={composeEditorRef}
                        contentEditable={true}
                        onInput={handleEditorInput}
                        className="wysiwyg-editor"
                        placeholder="What's happening? Share wires, discuss news, or use the formatting buttons..."
                      />

                      {/* Hidden File Input for Compose */}
                      <input
                        type="file"
                        accept="image/*,video/*"
                        ref={composeFileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleComposeFileChange}
                      />

                      {/* Attachment Previews */}
                      {attachedMedia && (
                        <div className="attachment-preview-container">
                          <div className="attachment-preview-box">
                            {attachedMedia.startsWith('data:image/') ? (
                              <img src={attachedMedia} alt="Upload Preview" className="attachment-preview-img" />
                            ) : (
                              <video src={attachedMedia} className="attachment-preview-img" />
                            )}
                            <button type="button" className="attachment-preview-remove" onClick={() => setAttachedMedia('')}>
                              <X size={10} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Action utilities bar at bottom */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid var(--border-color)',
                        paddingTop: '0.75rem',
                        marginTop: '0.25rem'
                      }}>
                        {/* Media attachment triggers */}
                        <div style={{ display: 'flex', gap: '1rem', color: 'var(--accent-orange)' }}>
                          <button
                            type="button"
                            title="Attach Photo / Video"
                            style={{ cursor: 'pointer', display: 'flex' }}
                            onClick={() => composeFileInputRef.current.click()}
                          >
                            <Image size={18} />
                          </button>
                          <button type="button" title="Add Poll" style={{ cursor: 'pointer', display: 'flex' }} onClick={() => alert('Poll attachments enabled in editorial wire')}>
                            <BarChart2 size={18} />
                          </button>
                        </div>

                        {/* Circular progress and Send Button */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div className="circular-progress-container" title={`${charsUsed}/${characterLimit} characters`}>
                            <svg width="24" height="24">
                              <circle className="circular-progress-circle" cx="12" cy="12" r="10" />
                              <circle
                                className="circular-progress-value"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke={progressColor}
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                transform="rotate(-90 12 12)"
                              />
                            </svg>
                          </div>
                          
                          <button
                            type="submit"
                            className="btn-primary"
                            style={{ padding: '0.4rem 1.25rem', height: '36px', fontSize: '0.85rem' }}
                            disabled={charsUsed > characterLimit}
                          >
                            <Send size={12} />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="card" style={{
                  padding: '1.5rem',
                  textAlign: 'center',
                  border: '1px dashed var(--border-color)',
                  color: 'var(--text-muted)',
                  marginBottom: '1rem'
                }}>
                  <AlertCircle size={24} style={{ color: 'var(--accent-orange)', marginBottom: '0.5rem', display: 'inline-block' }} />
                  <p style={{ fontSize: '0.9rem' }}>Log in to start a Charcha and join the community discussions.</p>
                </div>
              )}

              {/* 2. Timeline Filter and Sorting Row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1rem',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '0.75rem'
              }}>
                {/* Category selector capsules */}
                <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.25rem', flex: 1 }}>
                  <button
                    onClick={() => setCategory('')}
                    style={{
                      cursor: 'pointer',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: category === '' ? 'var(--pill-active-bg)' : 'transparent',
                      border: '1px solid var(--border-color)',
                      color: category === '' ? 'var(--text-main)' : 'var(--text-dim)'
                    }}
                  >
                    All Feed
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      style={{
                        cursor: 'pointer',
                        padding: '0.3rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: category === cat ? 'var(--pill-active-bg)' : 'transparent',
                        border: '1px solid var(--border-color)',
                        color: category === cat ? 'var(--text-main)' : 'var(--text-dim)',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      #{cat}
                    </button>
                  ))}
                </div>

                {/* Sort Select */}
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    onClick={() => setSortBy('-createdAt')}
                    style={{
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: sortBy === '-createdAt' ? 'var(--accent-orange)' : 'var(--text-dim)',
                      padding: '0.25rem 0.5rem'
                    }}
                  >
                    Latest
                  </button>
                  <span style={{ color: 'var(--border-color)' }}>|</span>
                  <button
                    onClick={() => setSortBy('trending')}
                    style={{
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: sortBy === 'trending' ? 'var(--accent-orange)' : 'var(--text-dim)',
                      padding: '0.25rem 0.5rem'
                    }}
                  >
                    Trending
                  </button>
                </div>
              </div>

              {/* 3. Feed Timeline */}
              {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>Fetching timeline...</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {posts.length > 0 ? (
                    posts.map((post) => {
                      const isExpanded = expandedPostId === post._id;
                      const hasUpvoted = user && post.upvotes?.includes(user.id);
                      const hasReposted = user && post.reposts?.includes(user.id);
                      const totalVotes = (post.upvotes?.length || 0) - (post.downvotes?.length || 0);
                      const youtubeEmbedUrl = getYoutubeEmbedUrl(post.content);
                      
                      const relativeTime = new Date(post.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      const authorRep = post.author?.reputation || 0;

                      return (
                        <div
                          key={post._id}
                          className="card"
                          onClick={() => setExpandedPostId(isExpanded ? null : post._id)}
                          style={{
                            cursor: 'pointer',
                            display: 'flex',
                            gap: '1rem',
                            padding: '1.25rem',
                            borderLeft: isExpanded ? '3px solid var(--accent-orange)' : '1px solid var(--border-color)',
                            background: isExpanded ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                            position: 'relative'
                          }}
                        >
                          {/* Left Column: Social Media Avatar */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                            <img
                              src={post.author?.avatar}
                              alt={post.author?.name}
                              onClick={() => handleOpenUserProfile(post.author?._id)}
                              style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                              ★{authorRep}
                            </span>
                          </div>

                          {/* Right Column: Post Body */}
                          <div style={{ flexGrow: 1, minWidth: 0 }}>
                            {/* Header: Author Info & Tag */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                              <span
                                onClick={() => handleOpenUserProfile(post.author?._id)}
                                style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.88rem', cursor: 'pointer' }}
                              >
                                {post.author?.name}
                              </span>
                              
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                                ({post.author?.headline || 'Citizen Journalist'})
                              </span>

                              {/* Message Button (1-to-1 DMs switch) */}
                              {user && post.author?._id !== user.id && (
                                <button
                                  onClick={(e) => handleStartDm(e, post.author)}
                                  style={{
                                    cursor: 'pointer',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0.15rem'
                                  }}
                                  title="Send Private Direct Message"
                                >
                                  <MessageSquare size={13} />
                                </button>
                              )}

                              {/* Follow Toggle */}
                              {user && post.author?._id !== user.id && (
                                <button
                                  onClick={(e) => handleFollowToggle(e, post.author?._id)}
                                  style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 800,
                                    color: user.following?.includes(post.author?._id) ? 'var(--text-muted)' : 'var(--primary)',
                                    background: user.following?.includes(post.author?._id) ? 'var(--pill-active-bg)' : 'transparent',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '10px',
                                    padding: '0.1rem 0.4rem',
                                    cursor: 'pointer'
                                  }}
                                  title={user.following?.includes(post.author?._id) ? 'Unfollow' : 'Follow Journalist'}
                                >
                                  {user.following?.includes(post.author?._id) ? 'Following' : '+ Follow'}
                                </button>
                              )}

                              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>•</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{relativeTime}</span>
                              
                              {/* Category Badge */}
                              <span style={{
                                marginLeft: 'auto',
                                background: 'var(--pill-active-bg)',
                                color: 'var(--accent-orange)',
                                fontSize: '0.62rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                padding: '0.15rem 0.4rem',
                                borderRadius: '3px',
                                border: '1px solid var(--border-color)'
                              }}>
                                {post.category}
                              </span>
                            </div>

                            {/* Post Content */}
                            <div style={{ marginBottom: '0.75rem' }}>
                              {/* Bold Title (Optional) */}
                              {post.title && (
                                <h3 style={{
                                  fontSize: '0.98rem',
                                  fontWeight: 800,
                                  color: 'var(--text-main)',
                                  marginBottom: '0.35rem',
                                  lineHeight: 1.3
                                }}>
                                  {post.title}
                                </h3>
                              )}
                              {/* Text content with parsed formatting */}
                              <div style={{
                                fontSize: '0.85rem',
                                color: 'var(--text-muted)',
                                display: isExpanded ? 'block' : '-webkit-box',
                                WebkitLineClamp: 4,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                lineHeight: 1.55
                              }}>
                                {parseRichText(post.content)}
                              </div>

                              {/* Base64 Uploaded File renderer */}
                              {renderMedia(post.media)}

                              {/* Link Preview renderer */}
                              {renderLinkPreview(post.content)}

                              {/* YouTube embedded player */}
                              {youtubeEmbedUrl && (
                                <div className="youtube-embed-wrapper" onClick={(e) => e.stopPropagation()}>
                                  <iframe
                                    src={youtubeEmbedUrl}
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  ></iframe>
                                </div>
                              )}
                            </div>

                            {/* Social Interaction Buttons Row (Twitter & YouTube Hybrid) */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              maxWidth: '520px',
                              color: 'var(--text-dim)',
                              fontSize: '0.75rem',
                              borderTop: isExpanded ? '1px solid var(--border-color)' : 'none',
                              paddingTop: isExpanded ? '0.75rem' : '0',
                              marginTop: isExpanded ? '0.75rem' : '0'
                            }}>
                              {/* Like button */}
                              <button
                                onClick={(e) => handleVote(e, post._id, 'upvote')}
                                style={{
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  color: hasUpvoted ? 'var(--primary)' : 'inherit',
                                  transition: 'var(--transition-fast)'
                                }}
                              >
                                <Heart size={15} fill={hasUpvoted ? 'var(--primary)' : 'none'} />
                                <span style={{ fontWeight: 700 }}>{totalVotes || 0}</span>
                              </button>

                              {/* Comment bubble */}
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem'
                              }}>
                                <MessageCircle size={15} />
                                <span style={{ fontWeight: 700 }}>{post.commentsCount || 0}</span>
                              </div>

                              {/* YouTube-style Hype Button */}
                              <button
                                onClick={(e) => handleHype(e, post._id)}
                                style={{
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  color: (post.hypeCount || 0) > 0 ? '#ea580c' : 'inherit',
                                  fontWeight: 700,
                                  transition: 'all var(--transition-fast)'
                                }}
                                title="Hype this post on the leaderboard (+10 pts)"
                              >
                                <Flame size={15} fill={(post.hypeCount || 0) > 0 ? '#ea580c' : 'none'} />
                                <span>{(post.hypeCount || 0) > 0 ? `${post.hypeCount} pts` : 'Hype'}</span>
                              </button>

                              {/* Twitter-style Repost Button */}
                              <button
                                onClick={(e) => handleRepost(e, post._id)}
                                style={{
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  color: hasReposted ? 'var(--accent-emerald)' : 'inherit',
                                  fontWeight: 700,
                                  transition: 'all var(--transition-fast)'
                                }}
                                title="Repost to Charcha timeline"
                              >
                                <Repeat2 size={16} />
                                <span>{post.reposts?.length || 0}</span>
                              </button>

                              {/* Share arrow */}
                              <button
                                onClick={(e) => handleShareClick(e, post)}
                                style={{
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  color: 'inherit'
                                }}
                                title="Share post"
                              >
                                <Share2 size={15} />
                              </button>

                              {/* Delete option for Admins/Owners */}
                              {user && (post.author?._id === user.id || ['Admin', 'Editor'].includes(user.role)) && (
                                <button
                                  onClick={(e) => handleDeletePost(e, post._id)}
                                  style={{
                                    cursor: 'pointer',
                                    color: 'var(--accent-rose)',
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Inline Expanded Discussion Comments */}
                          {isExpanded && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: '100%',
                                zIndex: 50,
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '0 0 12px 12px',
                                padding: '1rem',
                                boxShadow: 'var(--shadow-lg)',
                                marginTop: '-1px'
                              }}
                            >
                              <CommentSection postId={post._id} />
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '4rem 0',
                      border: '1px dashed var(--border-color)',
                      borderRadius: '12px',
                      color: 'var(--text-dim)'
                    }}>
                      No discussions found on your feed. Be the first to start a Charcha!
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* ==========================================================
               LIVE CHAT SECTION (SPLIT CHANNELS + MESSAGES WINDOW)
               ========================================================== */
            <div className="chat-columns-wrapper">
              
              {/* Left Panel: DM Switcher / Active Channel List */}
              <div className="chat-channels-list-sidebar">
                <div className="chat-channels-header">Conversations</div>
                <div className="chat-channels-list">
                  {/* Public Lobby Channel */}
                  <div
                    onClick={() => setSelectedChat('lobby')}
                    className={`chat-channel-item ${selectedChat === 'lobby' ? 'active' : ''}`}
                  >
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.75rem'
                    }}>L</div>
                    <span className="chat-channel-name">Public Lobby</span>
                  </div>

                  {/* Direct Messages Contacts list */}
                  {user && contacts.length > 0 && (
                    contacts.map((contact) => (
                      <div
                        key={contact._id}
                        onClick={() => setSelectedChat(contact)}
                        className={`chat-channel-item ${selectedChat !== 'lobby' && selectedChat?._id === contact._id ? 'active' : ''}`}
                      >
                        <img src={contact.avatar} alt={contact.name} className="chat-channel-avatar" />
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                          <span className="chat-channel-name">{contact.name}</span>
                          <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {contact.headline || 'Citizen Journalist'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Panel: Selected Chat Box */}
              {selectedChat === 'lobby' ? (
                /* Public Chat Lobby */
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className="chat-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-emerald)' }}></div>
                      <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>Charcha Public Lobby</h3>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Broadcasting</span>
                  </div>

                  {/* Chat Messages Logs */}
                  <div className="chat-messages-log">
                    {chatMessages.length > 0 ? (
                      chatMessages.map((msg) => {
                        const isOwn = user && msg.user?._id === user.id;
                        const msgTime = new Date(msg.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                        
                        return (
                          <div key={msg._id} className={`chat-bubble-wrapper ${isOwn ? 'own-message' : ''}`}>
                            {!isOwn && (
                              <img
                                src={msg.user?.avatar}
                                alt={msg.user?.name}
                                onClick={() => handleOpenUserProfile(msg.user?._id)}
                                style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, marginTop: '2px', cursor: 'pointer' }}
                              />
                            )}
                            <div className="chat-bubble">
                              <div className="chat-bubble-sender" onClick={() => handleOpenUserProfile(msg.user?._id)} style={{ cursor: 'pointer' }}>
                                <span>{msg.user?.name}</span>
                                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: isOwn ? 'rgba(255,255,255,0.85)' : 'var(--accent-gold)' }}>
                                  ({getReputationBadge(msg.user?.reputation || 0).label})
                                </span>
                              </div>
                              {msg.message && <span className="chat-bubble-text">{msg.message}</span>}
                              {renderMedia(msg.media)}
                              {renderLinkPreview(msg.message)}
                              <span className="chat-bubble-time">{msgTime}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem 0', fontSize: '0.82rem' }}>
                        Welcome to the Charcha Lobby! Chat with all online citizens...
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Hidden Chat Lobby File Input */}
                  <input
                    type="file"
                    accept="image/*,video/*"
                    ref={chatFileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleChatFileChange}
                  />

                  {/* Attachment preview inside Chat Input */}
                  {chatAttachedMedia && (
                    <div style={{ padding: '0.5rem 1.25rem', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)' }}>
                      <div className="attachment-preview-box" style={{ width: '60px', height: '60px' }}>
                        <img src={chatAttachedMedia} alt="Preview" className="attachment-preview-img" />
                        <button type="button" className="attachment-preview-remove" onClick={() => setChatAttachedMedia('')}>
                          <X size={8} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Message Input bar */}
                  {user ? (
                    <form onSubmit={handleSendChatMessage} className="chat-input-bar">
                      <button
                        type="button"
                        className="editor-btn"
                        title="Upload media attachment"
                        onClick={() => chatFileInputRef.current.click()}
                        style={{ color: 'var(--primary)', padding: '0.2rem' }}
                      >
                        <Paperclip size={18} />
                      </button>
                      <input
                        type="text"
                        placeholder="Type a message..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="input-field"
                        style={{ flexGrow: 1, height: '36px', borderRadius: '18px', paddingLeft: '1rem' }}
                      />
                      <button type="submit" className="btn-primary" style={{ padding: '0.4rem 1rem', height: '36px', borderRadius: '18px' }}>
                        <Send size={12} />
                      </button>
                    </form>
                  ) : (
                    <div style={{ padding: '1rem', textAlign: 'center', background: 'var(--bg-card-hover)', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Please <a href="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Log In</a> to send messages.
                    </div>
                  )}
                </div>
              ) : (
                /* Private Direct Messages (DMs) */
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className="chat-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img src={selectedChat.avatar} alt={selectedChat.name} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>{selectedChat.name}</h3>
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)' }}>{selectedChat.headline || 'Citizen Journalist'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedChat('lobby')}
                      style={{
                        cursor: 'pointer',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--primary)'
                      }}
                    >
                      Lobby
                    </button>
                  </div>

                  {/* Private Messages Log */}
                  <div className="chat-messages-log">
                    {dmMessages.length > 0 ? (
                      dmMessages.map((msg) => {
                        const isOwn = user && msg.sender?._id === user.id;
                        const msgTime = new Date(msg.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        });

                        return (
                          <div key={msg._id} className={`chat-bubble-wrapper ${isOwn ? 'own-message' : ''}`}>
                            {!isOwn && (
                              <img
                                src={msg.sender?.avatar}
                                alt={msg.sender?.name}
                                onClick={() => handleOpenUserProfile(msg.sender?._id)}
                                style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, marginTop: '2px', cursor: 'pointer' }}
                              />
                            )}
                            <div className="chat-bubble">
                              <div className="chat-bubble-sender" onClick={() => handleOpenUserProfile(msg.sender?._id)} style={{ cursor: 'pointer' }}>
                                <span>{msg.sender?.name}</span>
                              </div>
                              {msg.message && <span className="chat-bubble-text">{msg.message}</span>}
                              {renderMedia(msg.media)}
                              {renderLinkPreview(msg.message)}
                              <span className="chat-bubble-time">{msgTime}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem 0', fontSize: '0.82rem' }}>
                        This is the beginning of your private message history with {selectedChat.name}.
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Hidden DM File Input */}
                  <input
                    type="file"
                    accept="image/*,video/*"
                    ref={chatFileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleChatFileChange}
                  />

                  {/* Attachment preview inside Chat Input */}
                  {chatAttachedMedia && (
                    <div style={{ padding: '0.5rem 1.25rem', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)' }}>
                      <div className="attachment-preview-box" style={{ width: '60px', height: '60px' }}>
                        <img src={chatAttachedMedia} alt="Preview" className="attachment-preview-img" />
                        <button type="button" className="attachment-preview-remove" onClick={() => setChatAttachedMedia('')}>
                          <X size={8} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Private Input message box */}
                  <form onSubmit={handleSendDm} className="chat-input-bar">
                    <button
                      type="button"
                      className="editor-btn"
                      title="Upload media attachment"
                      onClick={() => chatFileInputRef.current.click()}
                      style={{ color: 'var(--primary)', padding: '0.2rem' }}
                    >
                      <Paperclip size={18} />
                    </button>
                    <input
                      type="text"
                      placeholder={`Message ${selectedChat.name.split(' ')[0]}...`}
                      value={dmInput}
                      onChange={(e) => setDmInput(e.target.value)}
                      className="input-field"
                      style={{ flexGrow: 1, height: '36px', borderRadius: '18px', paddingLeft: '1rem' }}
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '0.4rem 1rem', height: '36px', borderRadius: '18px' }}>
                      <Send size={12} />
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ==========================================================
           RIGHT SIDEBAR: TRENDING TOPICS & HYPE LEADERBOARD
           ========================================================== */}
        <div className="charcha-sidebar-right" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Trending Topics (Twitter style) */}
          <div className="charcha-sidebar-card">
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)', marginBottom: '0.85rem' }}>
              <TrendingUp size={16} style={{ color: 'var(--primary)' }} />
              Trending Wires
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {trendingTopics.map((topic) => (
                <div
                  key={topic}
                  onClick={() => handleHashtagClick(topic)}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0.25rem 0',
                    borderBottom: '1px solid rgba(0,0,0,0.03)'
                  }}
                  className="nav-link-hover"
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {topic}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                    {Math.floor(Math.random() * 80) + 20} citizen posts this week
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* YouTube-Style Hype Leaderboard */}
          <div className="charcha-sidebar-card">
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)', marginBottom: '0.85rem' }}>
              <Flame size={16} style={{ color: 'var(--accent-orange)' }} />
              Hype Leaderboard
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {leaderboard.length > 0 ? (
                leaderboard.map((post, idx) => (
                  <div
                    key={post._id}
                    onClick={() => {
                      setExpandedPostId(post._id);
                      setActiveTab('timeline');
                    }}
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.5rem',
                      background: 'var(--bg-main)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <span style={{ fontSize: '0.98rem', fontWeight: 900, color: idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : '#b45309' }}>
                      #{idx + 1}
                    </span>
                    <div style={{ minWidth: 0, flexGrow: 1 }}>
                      <p style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {post.title}
                      </p>
                      <span className="hype-rank-badge">
                        <Flame size={10} fill="#ea580c" />
                        {post.hypeCount || 0} pts
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                  No hype points registered this week yet.
                </p>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Profile Modal Overlay */}
      {selectedProfileUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }} onClick={() => setSelectedProfileUser(null)}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '420px',
            padding: '2rem',
            position: 'relative',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
            textAlign: 'center'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setSelectedProfileUser(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                padding: '0.25rem'
              }}
            >
              <X size={18} />
            </button>

            {/* Profile Avatar Container */}
            <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 1.25rem auto' }}>
              <img
                src={selectedProfileUser.avatar}
                alt={selectedProfileUser.name}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid var(--primary)'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: getReputationBadge(selectedProfileUser.reputation || 0).color,
                color: '#fff',
                fontSize: '0.62rem',
                fontWeight: 800,
                padding: '0.15rem 0.4rem',
                borderRadius: '10px',
                border: '2px solid var(--bg-card)'
              }}>
                ★ {selectedProfileUser.reputation || 0}
              </div>
            </div>

            {/* Profile Name & Badge */}
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
              {selectedProfileUser.name}
            </h2>
            <p style={{ fontSize: '0.78rem', color: getReputationBadge(selectedProfileUser.reputation || 0).color, fontWeight: 700, marginBottom: '0.75rem' }}>
              {getReputationBadge(selectedProfileUser.reputation || 0).label}
            </p>
            <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem', lineHeight: 1.3 }}>
              {selectedProfileUser.headline || 'Citizen Journalist'}
            </p>
            
            {/* Biography Box */}
            <div style={{
              background: 'rgba(255,255,255,0.015)',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              marginBottom: '1.25rem',
              textAlign: 'left',
              border: '1px solid var(--border-color)'
            }}>
              {selectedProfileUser.bio || 'This citizen has not added a biography yet.'}
            </div>

            {/* Stats Metric Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              borderTop: '1px solid var(--border-color)',
              borderBottom: '1px solid var(--border-color)',
              padding: '0.75rem 0',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Followers</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {selectedProfileUser.followers?.length || 0}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Following</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {selectedProfileUser.following?.length || 0}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            {user && selectedProfileUser._id !== user.id ? (
              <div style={{ display: 'flex', gap: '1rem' }}>
                {/* Follow Trigger */}
                <button
                  onClick={(e) => handleModalFollowToggle(e, selectedProfileUser._id)}
                  style={{
                    flexGrow: 1,
                    padding: '0.6rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: '1px solid var(--primary)',
                    background: user.following?.includes(selectedProfileUser._id) ? 'transparent' : 'var(--primary)',
                    color: user.following?.includes(selectedProfileUser._id) ? 'var(--primary)' : 'white'
                  }}
                >
                  {user.following?.includes(selectedProfileUser._id) ? 'Following' : '+ Follow'}
                </button>

                {/* Direct Message Trigger */}
                <button
                  onClick={(e) => handleModalStartDm(e, selectedProfileUser)}
                  style={{
                    flexGrow: 1,
                    padding: '0.6rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <MessageSquare size={13} />
                  Message
                </button>
              </div>
            ) : !user ? (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                Log in to follow or chat with this citizen.
              </p>
            ) : (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                This is your public citizen dashboard card.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CharchaForum;
