"use client";

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Failure } from '@/lib/api';

interface EditFailureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, data: Record<string, unknown>) => void;
  failure: Failure | null;
}

export default function EditFailureModal({ isOpen, onClose, onSubmit, failure }: EditFailureModalProps) {
  const [formData, setFormData] = useState({
    context: '',
    wrong_assumption: '',
    impact_level: 'Medium',
    lesson_learned: '',
    prevention_checklist: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (failure) {
      setFormData({
        context: failure.context,
        wrong_assumption: failure.wrong_assumption,
        impact_level: failure.impact_level || 'Medium',
        lesson_learned: failure.lesson_learned,
        prevention_checklist: (failure.prevention_checklist || []).join('\n')
      });
    }
  }, [failure]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!failure) return;
    setIsSubmitting(true);
    
    const submittedData = {
      ...formData,
      prevention_checklist: formData.prevention_checklist.split('\n').filter(s => s.trim() !== '')
    };
    
    await onSubmit(failure.id, submittedData);
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

        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Save size={20} color="var(--primary)" /> Edit Failure Learning
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Business Context</label>
            <textarea 
              required
              className="textarea" 
              value={formData.context}
              onChange={e => setFormData({...formData, context: e.target.value})}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>The Wrong Assumption</label>
            <textarea 
              required
              className="textarea" 
              value={formData.wrong_assumption}
              onChange={e => setFormData({...formData, wrong_assumption: e.target.value})}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Impact Level</label>
            <select 
              className="input"
              value={formData.impact_level}
              onChange={e => setFormData({...formData, impact_level: e.target.value})}
            >
              <option value="Low">Low - Process delay, minor rework</option>
              <option value="Medium">Medium - Missed sprint goal, internal friction</option>
              <option value="High">High - Customer impact, financial loss</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Lesson Learned</label>
            <textarea 
              required
              className="textarea" 
              value={formData.lesson_learned}
              onChange={e => setFormData({...formData, lesson_learned: e.target.value})}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Prevention Action Items (One per line)</label>
            <textarea 
              required
              className="textarea" 
              value={formData.prevention_checklist}
              onChange={e => setFormData({...formData, prevention_checklist: e.target.value})}
              rows={4}
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
