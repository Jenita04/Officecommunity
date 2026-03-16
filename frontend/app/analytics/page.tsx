"use client";

import { useEffect, useState } from 'react';
import LayoutWrapper from '@/components/LayoutWrapper';
import { API_URL } from '@/lib/api';
import { Users, BookOpen, Lightbulb, AlertTriangle, TrendingUp, Activity, Heart, ThumbsUp } from 'lucide-react';

interface AnalyticsData {
  metrics: {
    total_users: number;
    total_knowledge_posts: number;
    active_innovations: number;
    failures_logged: number;
  };
  health: {
    score: number;
    status: string;
  };
  insights: {
    most_queried_post_types: { type: string; count: number }[];
    top_problem_solvers: { pseudo_name: string; count: number }[];
    most_useful_failures: {
      context: string;
      likes: number;
      author: string;
    }[];
    most_liked_innovations: {
      title: string;
      likes: number;
      author: string;
    }[];
  };
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/analytics/summary`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <LayoutWrapper>
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          Loading Boardroom Analytics...
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <div className="animate-fade-in">
        
        {/* Header Section */}
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          marginBottom: '2rem'
        }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <TrendingUp color="var(--primary)" /> Leadership Analytics
            </h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>High-level insights into platform engagement and innovation metrics.</p>
          </div>
          
          {data && (
            <div className="glass-panel" style={{ 
              padding: '1rem 1.5rem', borderRadius: 'var(--radius-lg)',
              display: 'flex', alignItems: 'center', gap: '1rem',
              border: `1px solid ${data.health.score > 80 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: data.health.score > 80 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: data.health.score > 80 ? 'var(--primary)' : 'var(--warning)'
              }}>
                <Activity size={24} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Platform Health</p>
                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                  {data.health.score}/100 <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>({data.health.status})</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Top Level Metrics */}
        {data && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
                <Users size={100} />
              </div>
              <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Total Active Users</p>
              <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700 }}>{data.metrics.total_users}</h2>
            </div>
            
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1, color: 'var(--primary)' }}>
                <BookOpen size={100} />
              </div>
              <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Knowledge Base Posts</p>
              <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{data.metrics.total_knowledge_posts}</h2>
            </div>
            
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1, color: 'var(--secondary)' }}>
                <Lightbulb size={100} />
              </div>
              <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Innovation Proposals</p>
              <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{data.metrics.active_innovations}</h2>
            </div>
            
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1, color: 'var(--danger)' }}>
                <AlertTriangle size={100} />
              </div>
              <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Failures Logged</p>
              <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{data.metrics.failures_logged}</h2>
            </div>

          </div>
        )}

        {/* Detailed Panels */}
        {data && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '1.5rem' }}>
            
            {/* Platform Utilization Chart (Mock SVG representation) */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                Platform Activity Trend (30 Days)
              </h3>
              
              <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '1rem 0' }}>
                {/* Generating dynamic mock bars */}
                {[...Array(20)].map((_, i) => {
                  const height = Math.floor(Math.random() * 80) + 20;
                  const isRecent = i > 14;
                  return (
                    <div key={i} style={{ 
                      flex: 1, 
                      height: `${height}%`, 
                      background: isRecent ? 'var(--primary)' : 'rgba(79, 70, 229, 0.3)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease'
                    }}></div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                <span>30 Days Ago</span>
                <span>Today</span>
              </div>
            </div>

          </div>
        )}

        {/* Actionable Insights */}
        {data && data.insights && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>Top 10 Insights</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              
              {/* Most Queried Post Types */}
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}><BookOpen size={16}/> Top Post Types</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {data.insights.most_queried_post_types.length === 0 && <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>No data available</span>}
                  {data.insights.most_queried_post_types.map((item, i) => {
                    const maxCount = Math.max(...data.insights.most_queried_post_types.map(x => x.count), 1);
                    const widthPct = (item.count / maxCount) * 100;
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{item.type}</span>
                          <span>{item.count}</span>
                        </div>
                        <div style={{ width: '100%', background: 'var(--border)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${widthPct}%`, background: 'var(--primary)', height: '100%', borderRadius: '3px' }}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Problem Solvers */}
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Users size={16}/> Top Problem Solvers</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {data.insights.top_problem_solvers.length === 0 && <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>No data available</span>}
                  {data.insights.top_problem_solvers.map((item, i) => {
                    const maxCount = Math.max(...data.insights.top_problem_solvers.map(x => x.count), 1);
                    const widthPct = (item.count / maxCount) * 100;
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <span style={{ fontWeight: 600 }}>{item.pseudo_name}</span>
                          <span>{item.count} res.</span>
                        </div>
                        <div style={{ width: '100%', background: 'var(--border)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${widthPct}%`, background: 'var(--secondary)', height: '100%', borderRadius: '3px' }}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Most Useful Failures */}
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}><AlertTriangle size={16}/> Top Useful Failures</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {data.insights.most_useful_failures.length === 0 && <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>No data available</span>}
                  {data.insights.most_useful_failures.map((item, i) => {
                    const maxCount = Math.max(...data.insights.most_useful_failures.map(x => x.likes), 1);
                    const widthPct = (item.likes / maxCount) * 100;
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.context}</span>
                          <span style={{ whiteSpace: 'nowrap' }}>{item.likes} <Heart size={10} style={{display:'inline'}}/></span>
                        </div>
                        <div style={{ width: '100%', background: 'var(--border)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${widthPct}%`, background: 'var(--danger)', height: '100%', borderRadius: '3px' }}/>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>By {item.author}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Most Liked Innovations */}
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Lightbulb size={16}/> Top Liked Innovations</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {data.insights.most_liked_innovations.length === 0 && <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>No data available</span>}
                  {data.insights.most_liked_innovations.map((item, i) => {
                    const maxCount = Math.max(...data.insights.most_liked_innovations.map(x => x.likes), 1);
                    const widthPct = (item.likes / maxCount) * 100;
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</span>
                          <span style={{ whiteSpace: 'nowrap' }}>{item.likes} <ThumbsUp size={10} style={{display:'inline'}}/></span>
                        </div>
                        <div style={{ width: '100%', background: 'var(--border)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${widthPct}%`, background: '#10B981', height: '100%', borderRadius: '3px' }}/>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>By {item.author}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </LayoutWrapper>
  );
}
