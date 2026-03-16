"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Compass, UserPlus, FileText, Users, Mail, Lock, Shield, Hash, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useUser } from '@/lib/UserContext';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    real_name: '',
    email: '',
    role: 'EMPLOYEE',
    team_id: '',
    pseudo_name: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Register User
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      // 2. Login automatically
      await login(form.pseudo_name, form.password);
      router.push('/');
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred");
      } else {
        setError("An unexpected error occurred");
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
        maxWidth: '500px',
        width: '100%',
        padding: '3rem',
        borderRadius: 'var(--radius-lg)'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem' }}>Create Account</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Join the ecosystem to share & learn</p>
        </div>

        {error && (
          <div style={{
            padding: '1rem', background: 'rgba(163, 0, 0, 0.05)', color: 'var(--danger)',
            borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(163, 0, 0, 0.1)'
          }}>
            <ShieldAlert size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Identity Section */}
          <div style={{ padding: '1.5rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
              <ShieldCheck size={18} /> Private Identity (Admin Only)
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <FileText size={16} /> Real Name
                </label>
                <input required className="input" value={form.real_name} onChange={e => setForm({...form, real_name: e.target.value})} placeholder="e.g. Jane Doe" />
              </div>
              
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <Mail size={16} /> Corporate Email
                </label>
                <input required type="email" className="input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="jane@kaartech.com" />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <Shield size={16} /> System Role
                </label>
                <select className="input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="INNOVATION_MENTOR">Innovation Mentor</option>
                  <option value="LEADERSHIP">Leadership</option>
                  <option value="ADMIN">IT Support / Admin</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <Users size={16} /> Team ID
                </label>
                <input className="input" value={form.team_id} onChange={e => setForm({...form, team_id: e.target.value})} placeholder="e.g. SAP_DEV_01" />
              </div>
            </div>
          </div>

          {/* Public Profile Section */}
          <div style={{ padding: '1.5rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
              <UserPlus size={18} /> Public Profile
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <Hash size={16} /> Username (Pseudo Name)
                </label>
                <input required className="input" value={form.pseudo_name} onChange={e => setForm({...form, pseudo_name: e.target.value})} placeholder="e.g. TechNinja99" />
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>This is how other users will see you.</span>
              </div>
              
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <Lock size={16} /> Password
                </label>
                <input required type="password" className="input" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" />
              </div>
            </div>
          </div>

          <button disabled={loading} type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'center' }}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
          
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'underline' }}>Log In</Link>
        </div>
      </div>
    </div>
  );
}
