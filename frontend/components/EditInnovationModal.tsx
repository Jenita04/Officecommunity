"use client";

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Innovation } from '@/lib/api';

interface EditInnovationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, data: Record<string, unknown>) => void;
  innovation: Innovation | null;
}

export default function EditInnovationModal({ isOpen, onClose, onSubmit, innovation }: EditInnovationModalProps) {
  const [formData, setFormData] = useState({
    business_pain_point: '',
    proposed_solution_concept: '',
    expected_impact: '',
    scalability_potential: '',
    prototype_complexity: 'Medium (1 month)'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (innovation) {
      setFormData({
        business_pain_point: innovation.business_pain_point,
        proposed_solution_concept: innovation.proposed_solution_concept,
        expected_impact: innovation.expected_impact,
        scalability_potential: innovation.scalability_potential,
        prototype_complexity: innovation.prototype_complexity || 'Medium (1 month)'
      });
    }
  }, [innovation]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!innovation) return;
    setIsSubmitting(true);
    await onSubmit(innovation.id, formData);
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
          <Save size={20} color="var(--primary)" /> Edit Innovation
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Business Pain Point</label>
            <textarea 
              required
              className="textarea" 
              value={formData.business_pain_point}
              onChange={e => setFormData({...formData, business_pain_point: e.target.value})}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Proposed Solution Concept</label>
            <textarea 
              required
              className="textarea" 
              value={formData.proposed_solution_concept}
              onChange={e => setFormData({...formData, proposed_solution_concept: e.target.value})}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Expected Impact</label>
              <input 
                required
                className="input" 
                value={formData.expected_impact}
                onChange={e => setFormData({...formData, expected_impact: e.target.value})}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Scalability Potential</label>
              <input 
                required
                className="input" 
                value={formData.scalability_potential}
                onChange={e => setFormData({...formData, scalability_potential: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Estimated Prototype Complexity</label>
            <select 
              className="input"
              value={formData.prototype_complexity}
              onChange={e => setFormData({...formData, prototype_complexity: e.target.value})}
              style={{ appearance: 'none' }}
            >
              <option value="Low (1-2 weeks)">Low (1-2 weeks sprint)</option>
              <option value="Medium (1 month)">Medium (1 month sprint)</option>
              <option value="High (3+ months)">High (3+ months sprint)</option>
            </select>
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
