"use client";

import { useEffect, useState } from 'react';
import LayoutWrapper from '@/components/LayoutWrapper';
import { API_URL, markFailureUseful, createReport } from '@/lib/api';
import { AlertTriangle, ShieldCheck, Heart, MoreVertical, Flag } from 'lucide-react';
import LogFailureModal from '@/components/LogFailureModal';
import ReportModal from '@/components/ReportModal';
import { useUser } from '@/lib/UserContext';

interface Failure {
  id: number | string;
  impact_level?: string;
  context: string;
  wrong_assumption: string;
  lesson_learned: string;
  prevention_checklist: string[];
  useful_count: number;
  author: { pseudo_name: string };
}

export default function FailureWall() {
  const [failures, setFailures] = useState<Failure[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportedItemId, setReportedItemId] = useState<number | string>(0);
  const [activeMenuId, setActiveMenuId] = useState<number | string | null>(null);

  const { refreshUser } = useUser();

  const handleCreateFailure = async (data: Record<string, unknown>) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/failures/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const newFailure = (await res.json()) as Failure;
        setFailures([newFailure, ...failures]);
        setIsModalOpen(false);
        await refreshUser();
      } else {
        alert("Failed to log failure learning.");
      }
    } catch (err) {
      console.log("Failed to submit failure logic", err);
      alert("Error connecting to server");
    }
  };

  const handleUseful = async (id: number) => {
    const updatedCount = await markFailureUseful(id);
    if (updatedCount !== null) {
      setFailures(prev => prev.map(f => f.id === id ? { ...f, useful_count: updatedCount } : f));
    }
  };

  const submitReport = async (reason: string) => {
    const success = await createReport('FAILURE', Number(reportedItemId), reason);
    if (success) {
      alert("Report submitted successfully.");
    } else {
      alert("Failed to submit report.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/failures/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFailures(data);
        } else {
          console.error("Expected an array but got:", data);
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <LayoutWrapper>
      <div className="animate-fade-in">
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem',
          padding: '2rem', background: 'linear-gradient(to right, rgba(239, 68, 68, 0.1), transparent)',
          borderRadius: 'var(--radius-lg)', border: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertTriangle color="var(--danger)" /> Failure Learning Wall
            </h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>A psychologically safe space to document mistakes and build organizational resilience.</p>
          </div>
          <button className="btn btn-primary" style={{ background: 'var(--danger)', boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.39)' }} onClick={() => setIsModalOpen(true)}>
            Log a Learning
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {failures.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              No failure learnings documented yet.
            </div>
          ) : (
            failures.map((failure, i) => (
              <div key={i} className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--danger)' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span className="badge" style={{ background: 'rgba(163, 0, 0, 0.05)', color: 'var(--danger)', border: '1px solid rgba(163, 0, 0, 0.1)' }}>
                      Impact: {failure.impact_level || 'High'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: #{failure.id}</span>
                  </div>
                  
                  {/* Three Dots Menu for Reporting */}
                  <div style={{ position: 'relative' }}>
                    <button 
                      className="icon-btn" 
                      onClick={() => setActiveMenuId(activeMenuId === failure.id ? null : failure.id)} 
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <MoreVertical size={18} />
                    </button>
                    
                    {activeMenuId === failure.id && (
                      <div style={{
                        position: 'absolute', right: 0, top: '100%',
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)', padding: '0.5rem',
                        boxShadow: 'var(--shadow-lg)', zIndex: 10,
                        minWidth: '150px'
                      }}>
                        <button 
                          onClick={() => {
                            setReportedItemId(Number(failure.id));
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

                <h3 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0' }}>Context: {failure.context}</h3>
                
                <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 600 }}>Wrong Assumption:</p>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>{failure.wrong_assumption}</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600 }}>Lesson Learned:</p>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>{failure.lesson_learned}</p>
                </div>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={16} color="var(--secondary)" />
                    Prevention Checklist Generated
                  </div>
                  
                  <button 
                    onClick={() => handleUseful(Number(failure.id))}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.4rem', 
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: failure.useful_count > 0 ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: 600, transition: 'var(--transition)'
                    }}
                  >
                    <Heart size={20} className={failure.useful_count > 0 ? "fill-primary text-primary" : ""} /> 
                    {failure.useful_count || 0} Useful
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <LogFailureModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateFailure} 
      />

      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        onSubmit={submitReport} 
        itemType="FAILURE" 
      />
    </LayoutWrapper>
  );
}
