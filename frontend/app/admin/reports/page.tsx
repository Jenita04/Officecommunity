"use client";

import { useState, useEffect } from 'react';
import LayoutWrapper from '@/components/LayoutWrapper';
import { Report, getReports, updateReportStatus } from '@/lib/api';
import { ShieldCheck, AlertOctagon, CheckCircle, XCircle } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED' | 'DISMISSED'>('PENDING');

  const loadReports = async () => {
    const data = await getReports();
    setReports(data);
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    const updated = await updateReportStatus(id, status);
    if (updated) {
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: updated.status } : r));
    }
  };

  const filteredReports = filter === 'ALL' 
    ? reports 
    : reports.filter(r => r.status === filter);

  return (
    <LayoutWrapper>
      <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
        
        {/* Header */}
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem',
          padding: '2rem', background: 'linear-gradient(to right, rgba(0, 0, 0, 0.4), rgba(239, 68, 68, 0.1), transparent)',
          borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)'
        }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck color="var(--primary)" size={28} /> Reports Administration
            </h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Review and manage user reports across the Kaar platform.</p>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['PENDING', 'RESOLVED', 'DISMISSED', 'ALL'].map(f => (
              <button 
                key={f}
                className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                onClick={() => setFilter(f as any)}
              >
                {f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Reports Table / List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredReports.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
              No {filter !== 'ALL' ? filter.toLowerCase() : ''} reports found.
            </div>
          ) : filteredReports.map(report => (
            <div key={report.id} className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', gap: '2rem' }}>
              
              {/* Report Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <span className="badge" style={{ 
                    background: report.status === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : 
                                report.status === 'RESOLVED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: report.status === 'PENDING' ? '#F59E0B' : 
                           report.status === 'RESOLVED' ? '#10B981' : 'var(--danger)',
                    border: '1px solid currentColor'
                  }}>
                    {report.status}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {formatInTimeZone(new Date(report.created_at + 'Z'), 'Asia/Kolkata', 'MMM d, yyyy h:mm a')}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: '1.5rem' }}>
                  <div>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Reporter</p>
                    <p style={{ margin: 0, fontWeight: 500 }}>{report.reporter?.pseudo_name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Reported Context</p>
                    <p style={{ margin: 0, fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <AlertOctagon size={16} color="var(--danger)" />
                      {report.reported_item_type} #{report.reported_item_id} 
                      {report.reported_user?.pseudo_name ? ` (by ${report.reported_user.pseudo_name})` : ''}
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--danger)' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Reason Given:</p>
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>{report.reason}</p>
                </div>
              </div>

              {/* Actions Panel */}
              {report.status === 'PENDING' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '150px', borderLeft: '1px solid var(--border)', paddingLeft: '2rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Actions</p>
                  <button 
                    className="btn btn-secondary hover-bg"
                    style={{ background: 'rgba(16, 185, 129, 0.05)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-start' }}
                    onClick={() => handleStatusChange(report.id, 'RESOLVED')}
                  >
                    <CheckCircle size={16} /> Mark Resolved
                  </button>
                  <button 
                    className="btn btn-secondary hover-bg"
                    style={{ background: 'rgba(239, 68, 68, 0.05)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-start' }}
                    onClick={() => handleStatusChange(report.id, 'DISMISSED')}
                  >
                    <XCircle size={16} /> Dismiss Report
                  </button>
                </div>
              )}

            </div>
          ))}
        </div>
        
      </div>
    </LayoutWrapper>
  );
}
