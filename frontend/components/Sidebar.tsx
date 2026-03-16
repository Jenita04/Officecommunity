"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Home, Compass, Lightbulb, AlertTriangle, BarChart2, LogOut, Award, UserCircle2, ShieldCheck, BadgeCheck, MessageSquare } from 'lucide-react';
import LinkNext from 'next/link';
import { useUser } from '@/lib/UserContext';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = [
    { name: 'Posts', path: '/', icon: Home },
    { name: 'Search', path: '/discovery', icon: Compass },
    { name: 'Innovation Hub', path: '/innovation', icon: Lightbulb },
    { name: 'Failure Learning', path: '/failures', icon: AlertTriangle },
    { name: 'Suggestions', path: '/suggestions', icon: MessageSquare },
    { name: 'Contributors', path: '/contributors', icon: UserCircle2 },
    { name: 'My Profile', path: '/profile', icon: UserCircle2 },
    { name: 'Analytics', path: '/analytics', icon: BarChart2, adminOnly: true },
    { name: 'Top Innovations', path: '/admin/top-innovations', icon: Award, adminOnly: true },
    { name: 'Top Suggestions', path: '/admin/top-suggestions', icon: Award, adminOnly: true },
    { name: 'Reports', path: '/admin/reports', icon: ShieldCheck, adminOnly: true },
    { name: 'Users Directory', path: '/admin/users', icon: ShieldCheck, adminOnly: true },
  ];

  const handleLogout = () => {
    setIsLoggingOut(true);
    // Simulate logout delay
    setTimeout(() => {
      logout();
      setIsLoggingOut(false);
      router.push('/login');
    }, 800);
  };

  return (
    <div className="sidebar glass-panel" style={{ padding: '1.5rem', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '2rem', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-start', paddingLeft: '0.5rem' }}>
        <img src="/kaartech-logo.png" alt="KaarTech Logo" style={{ height: '40px', objectFit: 'contain' }} />
        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.5px' }}>KaarTech</span>
      </div>

      {/* Nav items container - scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => {
            if (item.adminOnly && user?.role !== 'ADMIN') return null;
            const isActive = pathname === item.path;
            
            return (
              <LinkNext 
                href={item.path} 
                key={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'rgba(163, 0, 0, 0.04)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                  transition: 'var(--transition)',
                  fontWeight: isActive ? 600 : 500
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <item.icon size={20} color={isActive ? 'var(--primary)' : 'currentColor'} />
                {item.name}
              </LinkNext>
            );
          })}
        </nav>
      </div>

      {/* User Section - Pinned to bottom */}
      <div style={{ padding: '1.25rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', marginTop: '1.5rem', flexShrink: 0 }}>
        {user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="avatar avatar-md">{user.pseudo_name.substring(0, 2)}</div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.pseudo_name}</p>
                  {user.is_verified && <BadgeCheck size={14} color="var(--primary)" aria-label="Verified Contributor" />}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Score: {user.reputation_score}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', 
                padding: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem',
                transition: 'var(--transition)',
                borderRadius: 'var(--radius-sm)',
                opacity: isLoggingOut ? 0.5 : 1,
                cursor: isLoggingOut ? 'wait' : 'pointer'
              }}
              onMouseEnter={(e) => { if(!isLoggingOut) { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'; } }}
              onMouseLeave={(e) => { if(!isLoggingOut) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; } }}
            >
              <LogOut size={16} /> {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Logged out
          </div>
        )}
      </div>
    </div>
  );
}
