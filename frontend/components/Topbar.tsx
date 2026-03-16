"use client";

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell, CheckCircle, Award } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { useUser } from '@/lib/UserContext';
import { formatInTimeZone } from 'date-fns-tz';

interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  post_id?: number;
  created_at: string;
}

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifRef]);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Only fetch if token exists
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      fetch(`${API_URL}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch(console.error);
    }
  }, [pathname]);

  const handleMarkAllRead = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    try {
      await fetch(`${API_URL}/notifications`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications([]);
      setShowNotifications(false);
    } catch (err) {
      console.error(err);
    }
  };
  
  const getTitle = () => {
    if (pathname === '/') return 'Posts';
    if (pathname === '/discovery') return 'Search';
    if (pathname === '/innovation') return 'Innovation Hub';
    if (pathname === '/failures') return 'Failure Learning Wall';
    if (pathname === '/analytics') return 'Leadership Dashboard';
    return 'Platform';
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  
  const { user } = useUser();

  return (
    <header style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 50,
      background: 'var(--background)',
      borderBottom: '1px solid var(--border)'
    }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
        {getTitle()}
      </h2>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* Search bar removed per user request, semantic discovery is its own page */}
        
        {user && (
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            background: 'var(--surface-hover)', padding: '0.4rem 0.8rem', 
            borderRadius: 'var(--radius-full)', border: '1px solid var(--border)'
          }}>
            <Award size={16} color="var(--primary)" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {user.reputation_score}
            </span>
          </div>
        )}

        <div style={{ position: 'relative' }} ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ 
              position: 'relative', width: '40px', height: '40px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: showNotifications ? 'var(--surface-hover)' : 'transparent', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid transparent', transition: 'var(--transition)'
            }}
            onMouseEnter={(e) => { if (!showNotifications) e.currentTarget.style.background = 'var(--surface-hover)'; }}
            onMouseLeave={(e) => { if (!showNotifications) e.currentTarget.style.background = 'transparent'; }}
          >
            <Bell size={20} color="var(--text-primary)" />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '8px', right: '10px',
                width: '8px', height: '8px', background: 'var(--danger)',
                borderRadius: '50%', boxShadow: '0 0 8px var(--danger)'
              }}></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="glass-panel animate-fade-in" style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              width: '320px', borderRadius: 'var(--radius-md)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)', overflow: 'hidden',
              zIndex: 100
            }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Notifications</h3>
                <button onClick={handleMarkAllRead} style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600 }}>Clear all</button>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 && (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    You have no notifications.
                  </div>
                )}
                {notifications.map(n => (
                  <div key={n.id} style={{ 
                    padding: '1rem', borderBottom: '1px solid var(--border)',
                    background: n.is_read ? 'transparent' : 'rgba(172, 0, 0, 0.05)',
                    display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                    cursor: n.post_id ? 'pointer' : 'default'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(172, 0, 0, 0.05)'}
                  onClick={() => {
                    if (n.post_id) {
                      router.push(`/?postId=${n.post_id}`);
                      setShowNotifications(false);
                    }
                  }}
                >
                    <div style={{ color: n.is_read ? 'var(--text-secondary)' : 'var(--primary)', marginTop: '2px' }}>
                      <CheckCircle size={16} />
                    </div>
                    <div>
                      <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', lineHeight: 1.4, color: n.is_read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{n.message}</p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {formatInTimeZone(new Date(n.created_at + 'Z'), 'Asia/Kolkata', 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
                <button style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>View All</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
