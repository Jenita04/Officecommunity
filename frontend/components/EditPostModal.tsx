"use client";

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Post } from '@/lib/api';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, data: Record<string, unknown>) => void;
  post: Post | null;
}

export default function EditPostModal({ isOpen, onClose, onSubmit, post }: EditPostModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    type: 'general',
    visibility: 'OPEN',
    visibility_group: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        description: post.description || '',
        tags: post.tags || '',
        type: post.type || 'general',
        visibility: post.visibility || 'OPEN',
        visibility_group: post.visibility_group || ''
      });
    }
  }, [post]);

  if (!isOpen || !post) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const submittedData = formData.visibility_group?.trim() !== '' 
      ? formData 
      : { ...formData, visibility_group: null };
    await onSubmit(post.id, submittedData as Record<string, unknown>);
    setIsSubmitting(false);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100
    }}>
      <div className="glass-panel" style={{
        width: '100%', maxWidth: '600px',
        padding: '2rem', borderRadius: 'var(--radius-lg)',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--text-secondary)' }}
        >
          <X size={24} />
        </button>

        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem' }}>Edit Post</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Title</label>
            <input 
              required
              className="input" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Description</label>
            <textarea 
              required
              className="textarea" 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Tags (comma separated)</label>
            <input 
              className="input" 
              value={formData.tags}
              onChange={e => setFormData({...formData, tags: e.target.value})}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Post Type</label>
            <select 
              className="input"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
            >
              <option value="information">Information</option>
              <option value="general">General</option>
              <option value="achievement">Achievement</option>
              <option value="career growth doubts">Career Growth Doubts</option>
              <option value="technical help">Technical Help</option>
              <option value="kebs help">KEBS Help</option>
            </select>
          </div>

          <div>
             <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Visibility</label>
             <select 
               className="input"
               value={formData.visibility}
               onChange={e => setFormData({...formData, visibility: e.target.value})}
             >
               <option value="OPEN">Open (Entire Organization)</option>
               <option value="CONTROLLED">Controlled (Restricted Group)</option>
             </select>
           </div>
 
           <div className="animate-fade-in">
             <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
               Target Team ID
             </label>
             <input 
               required={formData.visibility === 'CONTROLLED'}
               className="input" 
               value={formData.visibility_group}
               onChange={e => setFormData({...formData, visibility_group: e.target.value})}
             />
           </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" disabled={isSubmitting} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
