"use client";

import { useEffect, useState } from 'react';
import { getLeaderboard } from '@/lib/api';

interface Leader {
  id: string | number;
  pseudo_name?: string;
  reputation_score?: number;
}

export default function LeaderboardWidget() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaders() {
      const data = await getLeaderboard(5);
      setLeaders(data as unknown as Leader[]);
      setLoading(false);
    }
    fetchLeaders();
    
    // Refresh leaderboard every minute
    const interval = setInterval(fetchLeaders, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
      <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>🏆</span> Top Contributors
      </h4>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}>Loading...</div>
      ) : leaders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}>No contributors yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {leaders.map((user, index) => (
            <div key={user.id || index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ 
                  color: index === 0 ? 'var(--primary)' : index === 1 ? 'var(--text-secondary)' : index === 2 ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  width: '1rem',
                  textAlign: 'center'
                }}>
                  {index + 1}
                </span>
                <div className="avatar avatar-sm" style={{ 
                  border: index < 3 ? `1px solid ${index === 0 ? 'var(--primary)' : index === 1 ? 'var(--text-secondary)' : 'var(--text-primary)'}` : 'none' 
                }}>
                  {user.pseudo_name?.substring(0, 2) || 'U'}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: index < 3 ? 600 : 400 }}>
                  {user.pseudo_name}
                </span>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600 }}>{user.reputation_score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
