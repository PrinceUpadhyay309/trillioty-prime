import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ThumbsUp, Trash2, CornerDownRight, MessageSquare, Send } from 'lucide-react';

const CommentSection = ({ articleId, postId }) => {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyToId, setReplyToId] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchComments();
  }, [articleId, postId]);

  const fetchComments = async () => {
    try {
      const endpoint = articleId
        ? `/comments/article/${articleId}`
        : `/comments/post/${postId}`;
      const res = await api.get(endpoint);
      if (res.data.success) {
        setComments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const handleCreateComment = async (e, parentId = null) => {
    e.preventDefault();
    const content = parentId ? replyText : newCommentText;
    if (!content.trim()) return;

    try {
      const res = await api.post('/comments', {
        content,
        articleId,
        postId,
        parentId,
      });

      if (res.data.success) {
        setComments((prev) => [...prev, res.data.data]);
        if (parentId) {
          setReplyToId(null);
          setReplyText('');
        } else {
          setNewCommentText('');
        }
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleUpvote = async (commentId) => {
    if (!user) {
      alert('Please log in to upvote comments!');
      return;
    }
    try {
      const res = await api.post(`/comments/${commentId}/upvote`);
      if (res.data.success) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === commentId ? { ...c, upvotes: res.data.upvotes } : c
          )
        );
      }
    } catch (err) {
      console.error('Upvoting failed:', err);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      const res = await api.delete(`/comments/${commentId}`);
      if (res.data.success) {
        // Remove the comment and all its child replies from state
        setComments((prev) =>
          prev.filter((c) => c._id !== commentId && c.parentId !== commentId)
        );
      }
    } catch (err) {
      console.error('Deletion failed:', err);
    }
  };

  // Build comment tree client-side
  const rootComments = comments.filter((c) => !c.parentId);
  const getRepliesFor = (parentId) =>
    comments.filter((c) => c.parentId === parentId);

  // Helper component to render individual comment node recursively
  const CommentNode = ({ comment, depth = 0 }) => {
    const replies = getRepliesFor(comment._id);
    const isOwner = user && comment.author?._id === user.id;
    const isPrivileged = user && ['Admin', 'Editor'].includes(user.role);
    const isReplying = replyToId === comment._id;
    const isUpvotedByMe = user && comment.upvotes?.includes(user.id);

    const formattedTime = new Date(comment.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <div style={{
        marginLeft: depth > 0 ? `${Math.min(depth * 1.5, 4.5)}rem` : '0',
        marginTop: '1rem',
        position: 'relative'
      }}>
        {/* Thread connecting line for replies */}
        {depth > 0 && (
          <div style={{
            position: 'absolute',
            left: '-1rem',
            top: '0',
            bottom: '0',
            width: '2px',
            background: 'var(--border-color)',
            borderLeft: '2px dashed var(--border-color)',
            height: '100%',
            zIndex: 1
          }}></div>
        )}

        <div className="card" style={{
          padding: '1rem',
          borderRadius: '8px',
          backgroundColor: depth > 0 ? 'rgba(255,255,255,0.01)' : 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'none',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Comment Author Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img
                src={comment.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'}
                alt={comment.author?.name}
                style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{comment.author?.name}</span>
              <span style={{
                fontSize: '0.65rem',
                color: 'white',
                background: 'rgba(255,255,255,0.1)',
                padding: '0.1rem 0.3rem',
                borderRadius: '3px'
              }}>{comment.author?.role}</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{formattedTime}</span>
          </div>

          {/* Comment Content */}
          <p style={{ fontSize: '0.9rem', color: '#e2e8f0', whiteSpace: 'pre-wrap', marginBottom: '0.75rem' }}>
            {comment.content}
          </p>

          {/* Actions Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Upvote */}
            <button
              onClick={() => handleUpvote(comment._id)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.75rem',
                color: isUpvotedByMe ? 'var(--accent-emerald)' : 'var(--text-dim)',
                transition: 'var(--transition-fast)'
              }}
            >
              <ThumbsUp size={12} fill={isUpvotedByMe ? 'var(--accent-emerald)' : 'none'} />
              <span>{comment.upvotes?.length || 0}</span>
            </button>

            {/* Reply toggle */}
            {user && (
              <button
                onClick={() => {
                  setReplyToId(isReplying ? null : comment._id);
                  setReplyText('');
                }}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-dim)',
                  transition: 'var(--transition-fast)'
                }}
              >
                <CornerDownRight size={12} />
                <span>Reply</span>
              </button>
            )}

            {/* Delete */}
            {(isOwner || isPrivileged) && (
              <button
                onClick={() => handleDelete(comment._id)}
                style={{
                  cursor: 'pointer',
                  marginLeft: 'auto',
                  color: 'var(--accent-rose)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.2rem'
                }}
                title="Delete comment"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>

          {/* Inline Reply Input */}
          {isReplying && (
            <form onSubmit={(e) => handleCreateComment(e, comment._id)} style={{
              display: 'flex',
              gap: '0.5rem',
              marginTop: '0.75rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              paddingTop: '0.75rem'
            }}>
              <input
                type="text"
                placeholder={`Reply to ${comment.author?.name}...`}
                className="input-field"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                style={{ height: '36px', fontSize: '0.85rem' }}
                autoFocus
              />
              <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', height: '36px' }}>
                <Send size={12} />
              </button>
            </form>
          )}
        </div>

        {/* Recursively render replies */}
        {replies.map((reply) => (
          <CommentNode key={reply._id} comment={reply} depth={depth + 1} />
        ))}
      </div>
    );
  };

  return (
    <div style={{ marginTop: '2.5rem' }}>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <MessageSquare size={18} />
        Discussion ({comments.length})
      </h3>

      {/* Write New Top-Level Comment */}
      {user ? (
        <form onSubmit={(e) => handleCreateComment(e)} style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '2rem'
        }}>
          <img
            src={user.avatar}
            alt={user.name}
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <textarea
              placeholder="Join the charcha..."
              className="input-field"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              style={{ minHeight: '60px', resize: 'vertical', fontSize: '0.9rem' }}
            />
            <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-end', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              Post Comment
            </button>
          </div>
        </form>
      ) : (
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed var(--border-color)',
          borderRadius: '8px',
          padding: '1rem',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          marginBottom: '2rem'
        }}>
          Please log in to participate in the discussion.
        </div>
      )}

      {/* Render comments tree */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {rootComments.length > 0 ? (
          rootComments.map((comment) => (
            <CommentNode key={comment._id} comment={comment} />
          ))
        ) : (
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>
            No comments yet. Be the first to start the discussion!
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
