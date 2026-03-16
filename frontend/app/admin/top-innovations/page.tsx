"use client";

import { useState, useEffect } from 'react';
import LayoutWrapper from '@/components/LayoutWrapper';
import { getTopInnovations } from '@/lib/api';
import { Target, Zap, Clock, ThumbsUp, Award } from 'lucide-react';
import { API_URL } from '@/lib/api';

interface InnovationResponse {
  id: number;
  business_pain_point: string;
  proposed_solution_concept: string;
  expected_impact: string;
  scalability_potential: string;
  prototype_complexity: string;
  votes_count: number;
  status: string;
  author: { pseudo_name: string };
}

export default function TopInnovations() {
  const [innovations, setInnovations] = useState<InnovationResponse[]>([]);

  const fetchTopInnovations = async () => {
    try {
      const data = await getTopInnovations();
      // @ts-ignore
      setInnovations(data);
    } catch (err) {
      console.log("Failed to fetch top innovations", err);
    }
  };

  useEffect(() => {
    fetchTopInnovations();
  }, []);

  const handleUpvote = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/innovations/${id}/upvote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setInnovations(prev => prev.map(inv => inv.id === id ? { ...inv, votes_count: inv.votes_count + 1 } : inv));
      }
    } catch (err) {
      console.log("Failed to upvote", err);
    }
  };

  return (
    <LayoutWrapper>
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', paddingBottom: '3rem' }}>
        
        {/* Main Feed Column */}
        <div className="animate-fade-in" style={{ width: '100%', maxWidth: '600px' }}>
          
          {/* Header */}
          <div style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            marginBottom: '2rem', padding: '1.25rem 1.5rem', 
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Award size={20} color="var(--primary)" /> Top Innovations
              </h3>
              <p style={{ color: 'var(--text-secondary)', margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>Innovations with greater than 80 upvotes for leadership review.</p>
            </div>
          </div>
          
          {/* Feed Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {innovations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)', background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)' }}>
                No innovations have reached the 80 upvote threshold yet.
              </div>
            ) : innovations.map(inv => (
              <div key={inv.id} className="glass-panel hover-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <span className="badge" style={{ background: 'var(--primary)', color: '#fff' }}>
                    {inv.status}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    By {inv.author?.pseudo_name || 'Anonymous'}
                  </span>
                </div>
                
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap size={18} color="var(--primary)" /> {inv.business_pain_point}
                </h3>
                <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  <strong>Solution:</strong> {inv.proposed_solution_concept}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                   <div>
                     <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Impact</p>
                     <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>{inv.expected_impact}</p>
                   </div>
                   <div>
                     <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scalability</p>
                     <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>{inv.scalability_potential}</p>
                   </div>
                   <div>
                     <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Complexity</p>
                     <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                       <Clock size={14} /> {inv.prototype_complexity}
                     </p>
                   </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => handleUpvote(inv.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(172, 0, 0, 0.05)', color: 'var(--primary)' }}
                  >
                    <ThumbsUp size={16} /> Upvote ({inv.votes_count})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
