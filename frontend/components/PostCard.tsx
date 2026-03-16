"use client";

import { useState } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { ThumbsUp, MessageSquare, Bookmark, Send, Pencil, Trash2, BadgeCheck, MoreVertical, Flag } from 'lucide-react';
import { Post, Comment, createComment, likePost, updateCommentStatus, createReport } from '@/lib/api';
import ReportModal from './ReportModal';
import { useUser } from '@/lib/UserContext';

export default function PostCard({ post, onEdit, onDelete }: { post: Post, onEdit?: (post: Post) => void, onDelete?: (postId: number) => void }) {
  const [helpful, setHelpful] = useState(post.helpful_count);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{id: number, pseudo_name: string} | null>(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportedItemId, setReportedItemId] = useState<number>(0);
  const [reportedItemType, setReportedItemType] = useState<'POST'|'COMMENT'>('POST');
  const [showMenu, setShowMenu] = useState(false);

  const { user, refreshUser } = useUser();
  
  const isOwner = user && (user.pseudo_name === post.author?.pseudo_name || user.role === 'ADMIN' || user.role === 'LEADERSHIP');
  
  const [isSaved, setIsSaved] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedIds = JSON.parse(localStorage.getItem('savedPosts') || '[]');
      return savedIds.includes(post.id);
    }
    return false;
  });
  const tags = post.tags ? post.tags.split(',').map(t => t.trim()) : [];

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    const comment = await createComment(post.id, newComment, replyingTo?.id);
    if (comment) {
      if (replyingTo) {
        setComments(prev => prev.map(c => 
          c.id === replyingTo.id ? { ...c, replies: [...(c.replies || []), comment] } : c
        ));
        setReplyingTo(null);
      } else {
        setComments([...comments, comment]);
      }
      setNewComment('');
      await refreshUser();
    }
    setIsSubmitting(false);
  };

  const submitReport = async (reason: string) => {
    const success = await createReport(reportedItemType, reportedItemId, reason);
    if (success) {
      alert("Report submitted successfully.");
    } else {
      alert("Failed to submit report.");
    }
  };

  const handleReplyClick = (comment: Comment) => {
    setReplyingTo({ 
      id: comment.parent_id || comment.id, 
      pseudo_name: comment.author.pseudo_name 
    });
    setNewComment(''); // Clear input when switching
  };

  const renderCommentForm = (isReply: boolean) => (
    <div style={{ marginTop: isReply ? '0.5rem' : '0' }}>
      {isReply && replyingTo && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.8rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <span>Replying to <strong>@{replyingTo.pseudo_name}</strong></span>
          <button type="button" onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
        </div>
      )}
      <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
        <input 
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={isReply && replyingTo ? `Reply to ${replyingTo.pseudo_name}...` : "Add a solution or comment..."}
          className="input"
          style={{ 
            paddingRight: '2.5rem', fontSize: '0.875rem', padding: '0.75rem 2.5rem 0.75rem 1rem', 
            borderRadius: isReply ? '0 0 var(--radius-md) var(--radius-md)' : 'var(--radius-full)' 
          }}
          autoFocus={isReply}
        />
        <button 
          type="submit" 
          onClick={handleCommentSubmit}
          disabled={isSubmitting || !newComment.trim()}
          style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: newComment.trim() ? 'var(--primary)' : 'var(--text-secondary)', transition: 'color 0.2s', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );

    const handleResolveComment = async (commentId: number, status: string) => {
      const updated = await updateCommentStatus(post.id, commentId, status);
      if (updated) {
        // Recursive update function
        const updateInTree = (list: Comment[]): Comment[] => {
          return list.map(c => {
            if (c.id === commentId) return { ...c, resolution_status: status };
            if (c.replies) return { ...c, replies: updateInTree(c.replies) };
            return c;
          });
        };
        setComments(prev => updateInTree(prev));
        await refreshUser();
      }
    };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} style={{ 
      display: 'flex', flexDirection: 'column', gap: '0.5rem', 
      marginLeft: isReply ? '2.5rem' : '0', 
      borderLeft: isReply ? '2px solid var(--border)' : 'none', 
      paddingLeft: isReply ? '1rem' : '0', 
      marginTop: isReply ? '0.5rem' : '0' 
    }}>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <div className="avatar avatar-sm" style={{ width: '28px', height: '28px', fontSize: '0.7rem' }}>
          {comment.author?.pseudo_name?.substring(0,2)}
        </div>
        <div>
          <span style={{ fontWeight: 600, fontSize: '0.875rem', marginRight: '0.3rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
            {comment.author?.pseudo_name}
            {comment.author?.is_verified && <BadgeCheck size={14} color="var(--primary)" aria-label="Verified Contributor" />}
          </span>
          
          {comment.resolution_status === 'RESOLVED' && (
            <span style={{ fontSize: '0.65rem', background: 'var(--surface-hover)', color: 'var(--text-primary)', padding: '0.1rem 0.4rem', borderRadius: '4px', marginRight: '0.5rem', fontWeight: 600 }}>Resolved</span>
          )}
          {comment.resolution_status === 'PARTIALLY_RESOLVED' && (
            <span style={{ fontSize: '0.65rem', background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', padding: '0.1rem 0.4rem', borderRadius: '4px', marginRight: '0.5rem', fontWeight: 600 }}>Partially Resolved</span>
          )}

          <span style={{ fontSize: '0.875rem' }}>{comment.content}</span>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            <span>{formatInTimeZone(new Date(comment.created_at + 'Z'), 'Asia/Kolkata', 'MMM d, yyyy h:mm a')}</span>
            <button 
              type="button"
              onClick={() => handleReplyClick(comment)}
              style={{ fontWeight: 600, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Reply
            </button>
            <button 
              type="button"
              onClick={() => {
                 setReportedItemType('COMMENT');
                 setReportedItemId(comment.id);
                 setIsReportModalOpen(true);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              title="Report Comment"
            >
              <Flag size={12} />
            </button>
            {isOwner && comment.author?.pseudo_name !== post.author?.pseudo_name && ['career doubts', 'kebs help', 'technical help'].includes(post.type?.toLowerCase() || '') && (
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => handleResolveComment(comment.id, 'RESOLVED')}
                  style={{ color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                >
                  Query Resolved
                </button>
                <button 
                  type="button" 
                  onClick={() => handleResolveComment(comment.id, 'PARTIALLY_RESOLVED')}
                  style={{ color: 'var(--warning)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                >
                  Not Completely Resolved
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Recursively render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
      
      {/* Inline Reply Form */}
      {replyingTo?.id === comment.id && renderCommentForm(true)}
    </div>
  );

  return (
    <div className="glass-panel" style={{ 
      borderRadius: 'var(--radius-lg)', 
      marginBottom: '1.5rem', 
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--surface)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="avatar avatar-md" style={{ border: '2px solid var(--primary)', padding: '2px' }}>
            {post.author?.pseudo_name?.substring(0,2) || 'UK'}
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {post.author?.pseudo_name || 'Unknown User'}
              {post.author?.is_verified && <BadgeCheck size={16} color="var(--primary)" aria-label="Verified Contributor" />}
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>{post.created_at ? formatInTimeZone(new Date(post.created_at + 'Z'), 'Asia/Kolkata', 'MMM d, yyyy h:mm a') : ''}</span>
              <span>•</span>
              <span style={{ color: 'var(--secondary)' }}>{post.visibility}</span>
              {post.type && (
                <>
                  <span>•</span>
                  <span style={{ background: 'var(--primary)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    {post.type}
                  </span>
                </>
              )}
              {post.is_solution_validated && (
                <>
                  <span>•</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Verified</span>
                </>
              )}
            </div>
          </div>
        </div>
        {isOwner && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {onEdit && (
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', background: 'var(--surface-hover)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }} onClick={() => onEdit(post)}>
                <Pencil size={14} /> Edit
              </button>
            )}
            {onDelete && (
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', background: 'rgba(163, 0, 0, 0.05)', color: 'var(--danger)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }} onClick={() => {
                if (window.confirm('Are you sure you want to delete this post?')) {
                  onDelete(post.id);
                }
              }}>
                <Trash2 size={14} /> Delete
              </button>
            )}
          </div>
        )}
        
        {/* Three Dots Menu for Reporting the Post */}
        <div style={{ position: 'relative', marginLeft: '0.5rem' }}>
          <button 
            className="icon-btn" 
            onClick={() => setShowMenu(!showMenu)} 
            style={{ color: 'var(--text-secondary)' }}
          >
            <MoreVertical size={20} />
          </button>
          
          {showMenu && (
            <div style={{
              position: 'absolute', right: 0, top: '100%',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '0.5rem',
              boxShadow: 'var(--shadow-lg)', zIndex: 10,
              minWidth: '150px'
            }}>
              <button 
                onClick={() => {
                  setReportedItemType('POST');
                  setReportedItemId(post.id);
                  setIsReportModalOpen(true);
                  setShowMenu(false);
                }}
                style={{ 
                  display: 'flex', width: '100%', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 0.75rem', background: 'none', border: 'none',
                  color: 'var(--danger)', cursor: 'pointer', borderRadius: 'var(--radius-sm)',
                  textAlign: 'left', fontSize: '0.875rem'
                }}
                className="hover-bg"
              >
                <Flag size={16} /> Report Post
              </button>
            </div>
          )}
        </div>

      </div>
      
      {/* Content */}
      <div style={{ padding: '0 1.25rem 1.25rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>{post.title}</h3>
        <p style={{ color: 'var(--text-secondary)', margin: '0 0 1rem 0', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
          {post.description}
        </p>
        
        {/* Media Block */}
        {post.media_url && (
          <div style={{ marginBottom: '1rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000' }}>
            {post.media_url.match(/\.(mp4|webm|ogg)$/i) ? (
              <video src={post.media_url} controls style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }} />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={post.media_url} alt="Post media" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }} />
            )}
          </div>
        )}
        
        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {tags.map(tag => (
              <span key={tag} style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Actions (Instagram Style Footer) */}
      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        padding: '1rem 1.25rem', borderTop: '1px solid var(--border)' 
      }}>
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          {/* Like */}
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: hasLiked ? 'var(--primary)' : 'var(--text-primary)', transition: 'color 0.2s', fontWeight: 600 }}
            onClick={async () => {
              if (hasLiked) {
                setHelpful(h => h - 1);
                setHasLiked(false);
              } else {
                setHelpful(h => h + 1);
                setHasLiked(true);
                await likePost(post.id); // Call backend to update score
                await refreshUser();
              }
            }} >
            <ThumbsUp size={22} className={hasLiked ? "text-primary" : ""} /> {helpful}
          </button>
          {/* Comment */}
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)', fontWeight: 600 }}
            onClick={() => setShowComments(!showComments)}>
            <MessageSquare size={22} /> {comments.length}
          </button>
        </div>
        
        <div style={{ display: 'flex' }}>
          <button style={{ color: isSaved ? 'var(--primary)' : 'var(--text-primary)' }} onClick={() => {
            const savedIds = JSON.parse(localStorage.getItem('savedPosts') || '[]');
            if (isSaved) {
              const newSaved = savedIds.filter((id: number) => id !== post.id);
              localStorage.setItem('savedPosts', JSON.stringify(newSaved));
              setIsSaved(false);
            } else {
              savedIds.push(post.id);
              localStorage.setItem('savedPosts', JSON.stringify(savedIds));
              setIsSaved(true);
            }
          }}>
            <Bookmark size={22} className={isSaved ? 'fill-primary text-primary' : ''} />
          </button>
        </div>
      </div>

      {/* Discussion / Comments Section */}
      {showComments && (
        <div style={{ padding: '0 1.25rem 1.25rem', background: 'var(--surface-hover)' }}>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {comments.filter(c => !c.parent_id).length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>No solutions suggested yet. Be the first to help!</p>
            ) : (
              comments.filter(c => !c.parent_id).map(comment => renderComment(comment))
            )}
          </div>
          
          {/* Main Comment Form (only if not replying to something specific) */}
          {!replyingTo && renderCommentForm(false)}
        </div>
      )}

      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        onSubmit={submitReport} 
        itemType={reportedItemType} 
      />
    </div>
  );
}
