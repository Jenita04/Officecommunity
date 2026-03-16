"use client";

import { useState, useEffect } from 'react';
import LayoutWrapper from '@/components/LayoutWrapper';
import { API_URL, Suggestion, getTopSuggestions, updateSuggestion, deleteSuggestion } from '@/lib/api';
import { Award, Target, FileText, Settings, Trash2 } from 'lucide-react';

export default function TopSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const fetchSuggestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/suggestions/top`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setSuggestions(await res.json());
      }
    } catch (err) {
      console.log("Failed to fetch top suggestions", err);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleDelete = async (id: number) => {
    if(confirm("Are you sure you want to delete this top suggestion?")) {
      const success = await deleteSuggestion(id);
      if (success) {
        setSuggestions(prev => prev.filter(s => s.id !== id));
      }
    }
  }

  return (
    <LayoutWrapper>
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', paddingBottom: '3rem' }}>
        
        {/* Main Feed Column */}
        <div className="animate-fade-in" style={{ width: '100%', maxWidth: '800px' }}>
          
          {/* Header */}
          <div style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            marginBottom: '2rem', padding: '1.5rem 2rem', 
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                 <Award size={24} color="var(--primary)" /> Top Evaluated Suggestions
              </h3>
              <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0', fontSize: '0.95rem' }}>
                Suggestions that have received overwhelming community support (&gt; 80 upvotes).
              </p>
            </div>
          </div>
          
          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {suggestions.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)', background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)' }}>
                No suggestions have reached 80 upvotes yet to qualify for the Top board.
              </div>
            ) : suggestions.map(sug => (
              <div key={sug.id} className="glass-panel" style={{ 
                padding: '1.5rem', 
                borderRadius: 'var(--radius-lg)',
                borderTop: '3px solid var(--primary)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.03, color: 'var(--primary)', transform: 'rotate(15deg)' }}>
                  <Award size={120} />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
                  <span className="badge" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}>
                    {sug.votes_count} Upvotes
                  </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Author: {sug.author?.pseudo_name}
                  </span>
                </div>
                
                <h3 style={{ fontSize: '1.25rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', position: 'relative', zIndex: 1 }}>
                  <Target size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} /> 
                  {sug.title}
                </h3>
                
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <FileText size={14} /> Description
                  </p>
                  <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>{sug.description}</p>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', position: 'relative', zIndex: 1, borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                   <button 
                     className="btn btn-secondary" 
                     style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                     onClick={() => handleDelete(sug.id)}
                     title="Delete Suggestion"
                   >
                     <Trash2 size={16} color="var(--danger)" />
                   </button>
                   <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <Settings size={16} /> Evaluate
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
