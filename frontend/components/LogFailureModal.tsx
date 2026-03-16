"use client";

import { useState } from 'react';
import { X } from 'lucide-react';

interface LogFailureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
}

export default function LogFailureModal({ isOpen, onClose, onSubmit }: LogFailureModalProps) {
  const [formData, setFormData] = useState({
    context: '',
    wrong_assumption: '',
    impact_level: 'High',
    lesson_learned: '',
    prevention_checklist: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert comma-separated string to an array of strings
    const checklistArray = formData.prevention_checklist
      .split(',')
      .map(item => item.trim())
      .filter(item => item !== '');

    onSubmit({
      ...formData,
      prevention_checklist: checklistArray.length > 0 ? checklistArray : ["N/A"]
    });
    
    setFormData({ 
      context: '', 
      wrong_assumption: '', 
      impact_level: 'High', 
      lesson_learned: '', 
      prevention_checklist: '' 
    });
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

        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem' }}>Log a Failure Learning</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Context (What were you trying to do?)</label>
            <textarea 
              required
              className="textarea" 
              placeholder="E.g., Deploying new SAP Fiori app to production..."
              value={formData.context}
              onChange={e => setFormData({...formData, context: e.target.value})}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Wrong Assumption</label>
            <textarea 
              required
              className="textarea" 
              placeholder="What did you incorrectly assume?"
              value={formData.wrong_assumption}
              onChange={e => setFormData({...formData, wrong_assumption: e.target.value})}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Lesson Learned</label>
            <textarea 
              required
              className="textarea" 
              placeholder="What is the key takeaway?"
              value={formData.lesson_learned}
              onChange={e => setFormData({...formData, lesson_learned: e.target.value})}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Impact Level</label>
            <select 
              className="input"
              value={formData.impact_level}
              onChange={e => setFormData({...formData, impact_level: e.target.value})}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Prevention Checklist (comma separated)</label>
            <input 
              className="input" 
              placeholder="e.g. Verify config, Check DB locks"
              value={formData.prevention_checklist}
              onChange={e => setFormData({...formData, prevention_checklist: e.target.value})}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ background: 'var(--danger)', boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.39)' }}>Submit Learning</button>
          </div>
        </form>
      </div>
    </div>
  );
}
