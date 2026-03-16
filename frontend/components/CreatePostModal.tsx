"use client";

import { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { uploadMedia } from '@/lib/api';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
}

export default function CreatePostModal({ isOpen, onClose, onSubmit }: CreatePostModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    type: 'general',
    visibility: 'OPEN',
    visibility_group: ''
  });
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let mediaUrl = undefined;
    if (mediaFile) {
      const url = await uploadMedia(mediaFile);
      if (url) {
        mediaUrl = url;
      } else {
        alert("Failed to upload media. Post will be created without it.");
      }
    }
    
    const { visibility_group, ...restFormData } = formData;
    const submittedData = visibility_group.trim() !== '' 
      ? { ...formData, media_url: mediaUrl } 
      : { ...restFormData, media_url: mediaUrl };
    
    await onSubmit(submittedData);
    setFormData({ title: '', description: '', tags: '', type: 'general', visibility: 'OPEN', visibility_group: '' });
    setMediaFile(null);
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

        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem' }}>Create Post</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Title</label>
            <input 
              required
              className="input" 
              placeholder="Share an idea, challenge, or achievement..."
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Description</label>
            <textarea 
              required
              className="textarea" 
              placeholder="Provide context..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Tags (comma separated)</label>
            <input 
              className="input" 
              placeholder="e.g. SAP, SupplyChain"
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
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Media (Image/Video)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={18} />
                <span>Select File</span>
                <input 
                  type="file" 
                  accept="image/*,video/*" 
                  style={{ display: 'none' }}
                  onChange={e => {
                    if (e.target.files && e.target.files.length > 0) {
                      setMediaFile(e.target.files[0]);
                    }
                  }}
                />
              </label>
              {mediaFile && (
                <span style={{ fontSize: '0.875rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ImageIcon size={16} />
                  {mediaFile.name}
                  <button type="button" onClick={() => setMediaFile(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginLeft: '0.5rem' }}>
                    <X size={14} />
                  </button>
                </span>
              )}
            </div>
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
              Target Team ID {formData.visibility === 'OPEN' && <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>(Optional for notifications)</span>}
            </label>
            <input 
              required={formData.visibility === 'CONTROLLED'}
              className="input" 
              placeholder="e.g. SAP_DEV_01"
              value={formData.visibility_group}
              onChange={e => setFormData({...formData, visibility_group: e.target.value})}
            />
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
              {formData.visibility === 'CONTROLLED' 
                ? 'Only users within this team will see this post, and they will receive a notification.'
                : 'Optional: Notify a specific team about this post. The post will still be visible to everyone.'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" disabled={isSubmitting} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
