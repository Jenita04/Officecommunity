"use client";

import LayoutWrapper from '@/components/LayoutWrapper';
import LeaderboardWidget from '@/components/LeaderboardWidget';
import { Award } from 'lucide-react';

export default function ContributorsPage() {
  return (
    <LayoutWrapper>
      <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Header Section */}
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '1rem',
          padding: '2rem', background: 'linear-gradient(to right, rgba(163, 0, 0, 0.05), transparent)',
          borderRadius: 'var(--radius-lg)', border: '1px solid rgba(163, 0, 0, 0.1)'
        }}>
          <div style={{ 
            width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow)'
          }}>
            <Award size={30} color="white" />
          </div>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem' }}>Top Contributors</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Recognizing our most active community members who drive innovation and knowledge sharing.</p>
          </div>
        </div>

        {/* Leaderboard Section */}
        <div style={{ padding: '0 1rem' }}>
          <LeaderboardWidget />
        </div>
      </div>
    </LayoutWrapper>
  );
}
