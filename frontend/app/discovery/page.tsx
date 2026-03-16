"use client";

import { useState } from 'react';
import LayoutWrapper from '@/components/LayoutWrapper';
import { API_URL, Post } from '@/lib/api';
import { Search, BrainCircuit, CheckCircle, Compass } from 'lucide-react';
import PostCard from '@/components/PostCard';

export default function Discovery() {
  const [query, setQuery] = useState('');
  const [searchResponse, setSearchResponse] = useState<{answer: string, posts: Post[]} | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${API_URL}/discovery/search`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      // Expecting { answer: "...", posts: [...] }
      setSearchResponse(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutWrapper>
      <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '2rem' }}>
          <div style={{ 
            width: '80px', height: '80px', margin: '0 auto 1.5rem auto',
            background: 'var(--primary)', borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)', transform: 'rotate(10deg)'
          }}>
            <BrainCircuit size={40} color="white" style={{ transform: 'rotate(-10deg)' }} />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--primary)' }}>
            <Compass size={32} />
            <span>Search</span>
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>
            Search across posts, innovations, and failures.
          </p>
        </div>

        <form onSubmit={handleSearch} style={{ position: 'relative', marginBottom: '3rem', zIndex: 10 }}>
          <Search size={24} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
          <input 
            className="input glass-panel" 
            style={{ 
              padding: '1.25rem 1.25rem 1.25rem 4rem', fontSize: '1.125rem', 
              borderRadius: 'var(--radius-full)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.1)' 
            }}
            placeholder="Describe the problem, error code, or concept you're looking for..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{
            position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)',
            padding: '0.75rem 2rem', borderRadius: 'var(--radius-full)'
          }}>
            {loading ? 'Searching...' : 'Discover'}
          </button>
        </form>

        {searchResponse && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* AI Answer Section */}
            <div className="glass-panel animate-fade-in" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--primary)', background: 'var(--surface-hover)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <BrainCircuit color="var(--primary)" size={24} />
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--primary)' }}>AI Synthesis</h3>
              </div>
              <div style={{ margin: 0, lineHeight: 1.6, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                {searchResponse.answer.split('\n').map((line: string, i: number) => (
                  <p key={i} style={{ margin: '0 0 0.5rem 0' }}>{line}</p>
                ))}
              </div>
            </div>

            {/* Related Posts Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Source Knowledge Base Articles</h3>
                <div style={{ height: '1px', flex: 1, background: 'var(--border)' }}></div>
              </div>
              
              {searchResponse.posts && searchResponse.posts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {searchResponse.posts.map((post: Post) => {
                    // Extract the comment that solves the issue
                    const resolvedComment = post.comments?.find(
                      c => c.resolution_status === 'RESOLVED' || c.resolution_status === 'PARTIALLY_RESOLVED'
                    );

                    return (
                      <div key={String(post.id)} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <PostCard post={post} />
                        
                        {resolvedComment && (
                          <div className="glass-panel" style={{ 
                            marginLeft: '2rem', padding: '1.25rem', borderRadius: 'var(--radius-md)', 
                            borderLeft: '3px solid #10B981', background: 'rgba(16, 185, 129, 0.03)',
                            display: 'flex', gap: '1rem', alignItems: 'flex-start'
                          }}>
                            <CheckCircle color="#10B981" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10B981', marginBottom: '0.25rem' }}>
                                Verified Solution by {resolvedComment.author?.pseudo_name || 'Anonymous'}
                              </div>
                              <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                                {resolvedComment.content}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                 <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No related posts found.</p>
              )}
            </div>
          </div>
        )}

      </div>
    </LayoutWrapper>
  );
}
