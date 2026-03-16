"use client";

import { useEffect, useState } from 'react';
import LayoutWrapper from '@/components/LayoutWrapper';
import { useUser } from '@/lib/UserContext';
import { ShieldCheck, Mail, UserCircle2 } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AdminUser {
  id: number;
  email: string;
  pseudo_name: string;
  real_name: string | null;
  role: string;
  reputation_score: number;
}

export default function AdminUsersPage() {
  const { user } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Basic Role Protection Check
    if (user && user.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    async function loadUsers() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/users/admin`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        } else {
          console.error("Failed to fetch users, status:", res.status);
        }
      } catch (err) {
        console.error("Failed to load users", err);
      } finally {
        setLoading(false);
      }
    }

    if (user && user.role === 'ADMIN') {
        loadUsers();
    }
  }, [user, router]);

  if (loading) {
    return <LayoutWrapper><div style={{ textAlign: 'center', marginTop: '20vh' }}>Loading Admin Directory...</div></LayoutWrapper>;
  }

  return (
    <LayoutWrapper>
      <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Header */}
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '1rem',
          padding: '2rem', background: 'linear-gradient(to right, rgba(239, 68, 68, 0.1), transparent)',
          borderRadius: 'var(--radius-lg)', border: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          <div style={{ 
            width: '60px', height: '60px', borderRadius: '50%', background: 'var(--danger)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)'
          }}>
            <ShieldCheck size={30} color="white" />
          </div>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem' }}>Admin: Identity Directory</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Secure view of member real identities mapped to their public pseudo names.</p>
          </div>
        </div>

        {/* Directory Table */}
        <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--surface-hover)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ID</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Public (Pseudo) Name</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Real Name</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1rem', color: 'var(--secondary)' }}>#{u.id}</td>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <UserCircle2 size={16} color="var(--primary)" />
                      {u.pseudo_name}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 500, color: u.real_name ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {u.real_name || 'Not Provided'}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={16} />
                      {u.email}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600,
                      background: u.role === 'ADMIN' ? 'rgba(163, 0, 0, 0.05)' : 'var(--surface-hover)',
                      color: u.role === 'ADMIN' ? 'var(--danger)' : 'var(--text-secondary)'
                    }}>
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
      </div>
    </LayoutWrapper>
  );
}
