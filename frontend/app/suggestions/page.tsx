"use client";

import { useState, useEffect } from 'react';
import LayoutWrapper from '@/components/LayoutWrapper';
import { API_URL, Suggestion, getSuggestions, createSuggestion, upvoteSuggestion, createReport } from '@/lib/api';
import { MessageSquare, ThumbsUp, Plus, X, MoreVertical, Flag } from 'lucide-react';
import ReportModal from '@/components/ReportModal';
import { useUser } from '@/lib/UserContext';

function CreateSuggestionModal({ isOpen, onClose, onSubmit }: { isOpen: boolean, onClose: () => void, onSubmit: (data: Record<string, unknown>) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description });
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
          <MessageSquare size={20} color="var(--danger)" /> Propose Suggestion
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Suggestion Title</label>
            <input 
              required
              className="input" 
              placeholder="A short, clear summary of your idea..."
              value={title} onChange={(e) => setTitle(e.target.value)} 
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Detailed Description</label>
            <textarea 
              required
              className="textarea" 
              placeholder="What is the problem? How does this suggestion solve it? Who benefits?"
              rows={4}
              value={description} onChange={(e) => setDescription(e.target.value)} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Submit Suggestion</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SuggestionsFeed() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportedItemId, setReportedItemId] = useState<number>(0);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  
  const { refreshUser } = useUser();

  const loadSuggestions = async () => {
    const data = await getSuggestions();
    setSuggestions(data);
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const handleUpvote = async (id: number) => {
    const newCount = await upvoteSuggestion(id);
    if (newCount !== null) {
      setSuggestions(prev => prev.map(s => s.id === id ? { ...s, votes_count: newCount } : s));
      await refreshUser(); // Author might get points if it crossed 80
    }
  };

  const handleCreateSuggestion = async (formData: Record<string, unknown>) => {
    const newSug = await createSuggestion(formData);
    if (newSug) {
      setIsModalOpen(false);
      await refreshUser(); // Fetch points update for proposing idea
      loadSuggestions();
    } else {
      alert("Failed to submit suggestion");
    }
  };

  const submitReport = async (reason: string) => {
    const success = await createReport('SUGGESTION', reportedItemId, reason);
    if (success) {
      alert("Report submitted successfully.");
    } else {
      alert("Failed to submit report.");
    }
  };

  return (
    <LayoutWrapper>
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', paddingBottom: '3rem' }}>
        
        {/* Main Feed Column */}
        <div className="animate-fade-in" style={{ width: '100%', maxWidth: '600px' }}>
          
          {/* Create Suggestion Header */}
          <div style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            marginBottom: '2rem', padding: '1.25rem 1.5rem', 
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <MessageSquare size={20} color="var(--primary)" /> Employee Suggestions
              </h3>
              <p style={{ color: 'var(--text-secondary)', margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>Share ideas to improve KaarTech culture, processes, or space.</p>
            </div>
            <button className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }} onClick={() => setIsModalOpen(true)}>
              <Plus size={16} style={{display: 'inline-block', verticalAlign: 'text-bottom', marginRight: '4px'}}/> Create
            </button>
          </div>
          
          {/* Feed Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {suggestions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)', background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)' }}>
                No suggestions yet. Be the first to share your ideas!
              </div>
            ) : suggestions.map(sug => (
              <div key={sug.id} className="glass-panel hover-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
                    {sug.title}
                  </div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    By {sug.author?.pseudo_name || 'Anonymous'}
                  </span>
                  
                  {/* Three Dots Menu for Reporting */}
                  <div style={{ position: 'relative', marginLeft: '0.5rem' }}>
                    <button 
                      className="icon-btn" 
                      onClick={() => setActiveMenuId(activeMenuId === sug.id ? null : sug.id)} 
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <MoreVertical size={18} />
                    </button>
                    
                    {activeMenuId === sug.id && (
                      <div style={{
                        position: 'absolute', right: 0, top: '100%',
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)', padding: '0.5rem',
                        boxShadow: 'var(--shadow-lg)', zIndex: 10,
                        minWidth: '150px'
                      }}>
                        <button 
                          onClick={() => {
                            setReportedItemId(sug.id);
                            setIsReportModalOpen(true);
                            setActiveMenuId(null);
                          }}
                          style={{ 
                            display: 'flex', width: '100%', alignItems: 'center', gap: '0.5rem',
                            padding: '0.5rem 0.75rem', background: 'none', border: 'none',
                            color: 'var(--danger)', cursor: 'pointer', borderRadius: 'var(--radius-sm)',
                            textAlign: 'left', fontSize: '0.875rem'
                          }}
                          className="hover-bg"
                        >
                          <Flag size={14} /> Report
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  {sug.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => handleUpvote(sug.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
                  >
                    <ThumbsUp size={16} /> Upvote ({sug.votes_count})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CreateSuggestionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateSuggestion} 
      />

      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        onSubmit={submitReport} 
        itemType="SUGGESTION" 
      />
    </LayoutWrapper>
  );
}
