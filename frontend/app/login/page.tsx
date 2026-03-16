"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Compass, Hash, Lock, ShieldAlert } from 'lucide-react';
import { useUser } from '@/lib/UserContext';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(form.username, form.password);
      router.push('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Login failed");
      } else {
        setError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, var(--bg-alt) 0%, var(--bg) 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '500px', height: '500px', background: 'var(--primary)', filter: 'blur(100px)', opacity: 0.1, borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '600px', height: '600px', background: 'var(--accent)', filter: 'blur(120px)', opacity: 0.05, borderRadius: '50%' }} />
      
      {/* Background Logo */}
      <div style={{ position: 'absolute', top: '2.5rem', left: '3rem', zIndex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img src="/kaartech-logo.png" alt="KaarTech Logo" style={{ height: '40px', objectFit: 'contain' }} />
        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.5px' }}>KaarTech</span>
      </div>

      <div className="glass-panel animate-fade-in" style={{
        maxWidth: '450px',
        width: '100%',
        padding: '3rem',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        zIndex: 1,
        border: '1px solid var(--border)'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem' }}>Login Account</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Welcome back, innovator.</p>
        </div>

        {error && (
          <div style={{
            padding: '1rem', background: 'var(--danger-light)', color: 'var(--danger)',
            borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <ShieldAlert size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <Hash size={16} /> Public Username
            </label>
            <input required className="input" value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="e.g. TechNinja99" />
          </div>
          
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <Lock size={16} /> Password
            </label>
            <input required type="password" className="input" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" />
          </div>

          <button disabled={loading} type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
          
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Don&apos;t have an account? <Link href="/register" style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'underline' }}>Sign Up here</Link>
        </div>
      </div>
    </div>
  );
}
