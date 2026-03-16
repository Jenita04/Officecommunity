"use client";

import { useEffect, useState } from 'react';
import LayoutWrapper from '@/components/LayoutWrapper';
import { useUser } from '@/lib/UserContext';
import { Save, Settings, BadgeCheck, FileText, Target, AlertTriangle, Zap, Clock, ThumbsUp, Trash2, Edit2, MessageSquare } from 'lucide-react';
import { Post, getPosts, getMyPosts, deletePost, updatePost, Innovation, Failure, getMyInnovations, getMyFailures, deleteInnovation, updateInnovation, deleteFailure, updateFailure, Suggestion, getMySuggestions, deleteSuggestion, updateSuggestion } from '@/lib/api';
import PostCard from '@/components/PostCard';
import EditPostModal from '@/components/EditPostModal';
import EditInnovationModal from '@/components/EditInnovationModal';
import EditFailureModal from '@/components/EditFailureModal';

interface ProfileDetails {
  id: string;
  email: string;
  pseudo_name: string;
  real_name: string | null;
  role: string;
  reputation_score: number;
  is_verified?: boolean;
}

export default function ProfilePage() {
  const { user, setUser, refreshUser } = useUser();
  const [profile, setProfile] = useState<ProfileDetails | null>(null);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'saved' | 'authored' | 'innovations' | 'failures' | 'suggestions'>('saved');
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [myInnovations, setMyInnovations] = useState<Innovation[]>([]);
  const [editingInnovation, setEditingInnovation] = useState<Innovation | null>(null);
  const [isEditInnovationModalOpen, setIsEditInnovationModalOpen] = useState(false);

  const [myFailures, setMyFailures] = useState<Failure[]>([]);
  const [editingFailure, setEditingFailure] = useState<Failure | null>(null);
  const [isEditFailureModalOpen, setIsEditFailureModalOpen] = useState(false);
  
  const [mySuggestions, setMySuggestions] = useState<Suggestion[]>([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ pseudo_name: '', real_name: '' });

  useEffect(() => {
    // 1. Fetch Profile Details
    async function loadProfile() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8000/api/users/profile/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setEditForm({
            pseudo_name: data.pseudo_name || '',
            real_name: data.real_name || ''
          });
        }
      } catch (err) {
        console.error("Error fetching profile", err);
      }
    }
    
    // 2. Fetch all posts and filter saved
    async function loadSavedPosts() {
      // In a real app we'd just fetch the saved posts via an endpoint or properly typed local map.
      // Here we parse from localStorage for mock functionality
      const savedIds = JSON.parse(localStorage.getItem('savedPosts') || '[]');
      if (savedIds.length > 0) {
        const allPosts = await getPosts();
        setSavedPosts(allPosts.filter((p: Post) => savedIds.includes(p.id)));
      }
    }

    // 3. Fetch My Posts
    async function loadMyPosts() {
      const posts = await getMyPosts();
      setMyPosts(posts);
    }
    
    // 4. Fetch My Innovations
    async function loadMyInnovations() {
      const inn = await getMyInnovations();
      setMyInnovations(inn);
    }

    // 5. Fetch My Failures
    async function loadMyFailures() {
      const fails = await getMyFailures();
      setMyFailures(fails);
    }
    
    // 6. Fetch My Suggestions
    async function loadMySuggestions() {
      const suggs = await getMySuggestions();
      setMySuggestions(suggs);
    }

    loadProfile();
    loadSavedPosts();
    loadMyPosts();
    loadMyInnovations();
    loadMyFailures();
    loadMySuggestions();
  }, []);

  // Update local profile score if the global user context score changes
  // (e.g. from deleting/editing a post via PostCard)
  useEffect(() => {
    if (user && profile && user.reputation_score !== profile.reputation_score) {
      setProfile(prev => prev ? { ...prev, reputation_score: user.reputation_score } : null);
    }
  }, [user?.reputation_score]);

  const handleDeletePost = async (id: number) => {
    const success = await deletePost(id);
    if (success) {
      setMyPosts(prev => prev.filter(p => p.id !== id));
      setSavedPosts(prev => prev.filter(p => p.id !== id));
      await refreshUser();
    } else {
      alert("Failed to delete post.");
    }
  };

  const handleEditClick = (post: Post) => {
    setEditingPost(post);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (id: number, data: Record<string, unknown>) => {
    const updated = await updatePost(id, data);
    if (updated) {
      setMyPosts(prev => prev.map(p => p.id === id ? updated : p));
      setSavedPosts(prev => prev.map(p => p.id === id ? updated : p));
      setIsEditModalOpen(false);
    } else {
      alert("Failed to update post.");
    }
  };

  const handleDeleteInnovation = async (id: number) => {
    const success = await deleteInnovation(id);
    if (success) {
      setMyInnovations(prev => prev.filter(p => p.id !== id));
      await refreshUser();
    } else {
      alert("Failed to delete innovation.");
    }
  };

  const handleEditInnovationClick = (inn: Innovation) => {
    setEditingInnovation(inn);
    setIsEditInnovationModalOpen(true);
  };

  const handleEditInnovationSubmit = async (id: number, data: Record<string, unknown>) => {
    const updated = await updateInnovation(id, data);
    if (updated) {
      setMyInnovations(prev => prev.map(p => p.id === id ? updated : p));
      setIsEditInnovationModalOpen(false);
    } else {
      alert("Failed to update innovation.");
    }
  };

  const handleDeleteFailure = async (id: number) => {
    const success = await deleteFailure(id);
    if (success) {
      setMyFailures(prev => prev.filter(p => p.id !== id));
      await refreshUser();
    } else {
      alert("Failed to delete failure.");
    }
  };

  const handleEditFailureClick = (fail: Failure) => {
    setEditingFailure(fail);
    setIsEditFailureModalOpen(true);
  };

  const handleEditFailureSubmit = async (id: number, data: Record<string, unknown>) => {
    const updated = await updateFailure(id, data);
    if (updated) {
      setMyFailures(prev => prev.map(p => p.id === id ? updated : p));
      setIsEditFailureModalOpen(false);
    } else {
      alert("Failed to update failure.");
    }
  };
  
  const handleDeleteSuggestion = async (id: number) => {
    if(confirm("Are you sure you want to delete this suggestion?")) {
      const success = await deleteSuggestion(id);
      if (success) {
        setMySuggestions(prev => prev.filter(p => p.id !== id));
        await refreshUser();
      } else {
        alert("Failed to delete suggestion.");
      }
    }
  };

  const handleEditSuggestionToggle = async (sug: Suggestion) => {
     const newTitle = prompt("Edit Suggestion Title:", sug.title);
     if (newTitle === null) return;
     const newDesc = prompt("Edit Suggestion Description:", sug.description);
     if (newDesc === null) return;
     
     const updated = await updateSuggestion(sug.id, { title: newTitle, description: newDesc });
     if (updated) {
       setMySuggestions(prev => prev.map(p => p.id === sug.id ? updated : p));
     } else {
       alert("Failed to update suggestion.");
     }
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/users/profile', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setUser(updated); // Update context
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!profile) return <LayoutWrapper><div style={{ textAlign: 'center', marginTop: '20vh' }}>Loading Profile...</div></LayoutWrapper>;

  return (
    <LayoutWrapper>
      <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Profile Header */}
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{
            width: '120px', height: '120px', borderRadius: '50%', background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.5rem', fontWeight: 700,
            boxShadow: 'var(--shadow-glow)'
          }}>
            {profile.pseudo_name.substring(0, 2).toUpperCase()}
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {profile.pseudo_name}
                  {profile.is_verified && <BadgeCheck size={24} color="var(--primary)" aria-label="Verified Contributor" />}
                  {profile.role === 'ADMIN' && <BadgeCheck size={24} color="var(--primary)" />}
                </h1>
                
                <p style={{ margin: 0, color: 'var(--secondary)', fontWeight: 600, fontSize: '1.1rem' }}>
                  {profile.reputation_score} Rep Points
                </p>
              </div>
              
              <button onClick={() => setIsEditing(!isEditing)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                <Settings size={16} /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            </div>
            
            {/* Edit Form */}
            {isEditing && (
              <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Public Display Name (Username)</label>
                    <input className="input" value={editForm.pseudo_name} onChange={e => setEditForm({...editForm, pseudo_name: e.target.value})} placeholder="e.g. SAP_Ninja" />
                  </div>
                </div>
                <button onClick={handleSaveProfile} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Save Changes</button>
              </div>
            )}
            
            {!isEditing && (
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.1)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Email (Private)</span>
                  <span style={{ fontWeight: 500 }}>{profile.email}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Real Name</span>
                  <span style={{ fontWeight: 500 }}>{profile.real_name || 'Not provided'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '1rem', padding: '0 1rem 1rem', flexWrap: 'wrap' }}>
          <button style={{ 
            padding: '0.5rem 1rem', color: activeTab === 'saved' ? 'white' : 'var(--text-secondary)', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            background: activeTab === 'saved' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', 
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', cursor: 'pointer',
            transition: 'all 0.2s ease'
          }} onClick={() => setActiveTab('saved')}>
            <Save size={18} /> Saved Posts ({savedPosts.length})
          </button>
          
          <button style={{ 
            padding: '0.5rem 1rem', color: activeTab === 'authored' ? 'white' : 'var(--text-secondary)', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            background: activeTab === 'authored' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', 
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', cursor: 'pointer',
            transition: 'all 0.2s ease'
          }} onClick={() => setActiveTab('authored')}>
            <FileText size={18} /> My Posts ({myPosts.length})
          </button>
          
          <button style={{ 
            padding: '0.5rem 1rem', color: activeTab === 'innovations' ? 'white' : 'var(--text-secondary)', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            background: activeTab === 'innovations' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', 
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', cursor: 'pointer',
            transition: 'all 0.2s ease'
          }} onClick={() => setActiveTab('innovations')}>
            <Target size={18} /> My Innovations ({myInnovations.length})
          </button>

          <button style={{ 
            padding: '0.5rem 1rem', color: activeTab === 'failures' ? 'white' : 'var(--text-secondary)', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            background: activeTab === 'failures' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', 
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', cursor: 'pointer',
            transition: 'all 0.2s ease'
          }} onClick={() => setActiveTab('failures')}>
            <AlertTriangle size={18} /> My Failures ({myFailures.length})
          </button>
          
          <button style={{ 
            padding: '0.5rem 1rem', color: activeTab === 'suggestions' ? 'white' : 'var(--text-secondary)', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            background: activeTab === 'suggestions' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', 
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', cursor: 'pointer',
            transition: 'all 0.2s ease'
          }} onClick={() => setActiveTab('suggestions')}>
            <MessageSquare size={18} /> My Suggestions ({mySuggestions.length})
          </button>
        </div>

        {/* Feed */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'saved' && (
            savedPosts.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <Save size={24} color="rgba(255,255,255,0.5)" />
                </div>
                <h3 style={{ margin: '0 0 0.5rem' }}>No Saved Posts</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Posts you save will appear here for quick access.</p>
              </div>
            ) : (
              savedPosts.map(post => <PostCard key={post.id} post={post} onEdit={handleEditClick} onDelete={handleDeletePost} />)
            )
          )}

          {activeTab === 'authored' && (
            myPosts.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <FileText size={24} color="rgba(255,255,255,0.5)" />
                </div>
                <h3 style={{ margin: '0 0 0.5rem' }}>No Authored Posts</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Posts you create will appear here.</p>
              </div>
            ) : (
              myPosts.map(post => <PostCard key={post.id} post={post} onEdit={handleEditClick} onDelete={handleDeletePost} />)
            )
          )}

          {activeTab === 'innovations' && (
            myInnovations.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <Target size={24} color="rgba(255,255,255,0.5)" />
                </div>
                <h3 style={{ margin: '0 0 0.5rem' }}>No Innovations</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Innovations you propose will appear here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {myInnovations.map(inn => (
                  <div key={inn.id} className="glass-panel hover-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                      <button className="icon-btn" onClick={() => handleEditInnovationClick(inn)} title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button className="icon-btn" onClick={() => handleDeleteInnovation(inn.id)} title="Delete" style={{ color: 'var(--error)' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    <div style={{ display: 'inline-flex', padding: '0.25rem 0.75rem', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--primary)', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem', alignItems: 'center', gap: '0.25rem' }}>
                      <Zap size={14} /> Stage: {inn.status}
                    </div>

                    <h3 style={{ margin: '0 0 1rem 0' }}>Business Pain Point</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>{inn.business_pain_point}</p>

                    <h3 style={{ margin: '1.5rem 0 1rem 0' }}>Proposed Solution</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>{inn.proposed_solution_concept}</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Expected Impact</span>
                        <div style={{ fontWeight: 500 }}>{inn.expected_impact}</div>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Scalability</span>
                        <div style={{ fontWeight: 500 }}>{inn.scalability_potential}</div>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Complexity</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500 }}>
                          <Clock size={14} /> {inn.prototype_complexity}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'failures' && (
            myFailures.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <AlertTriangle size={24} color="rgba(255,255,255,0.5)" />
                </div>
                <h3 style={{ margin: '0 0 0.5rem' }}>No Failures Logged</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Failures you share will appear here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {myFailures.map(fail => (
                  <div key={fail.id} className="glass-panel hover-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--warning)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                      <button className="icon-btn" onClick={() => handleEditFailureClick(fail)} title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button className="icon-btn" onClick={() => handleDeleteFailure(fail.id)} title="Delete" style={{ color: 'var(--error)' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <h3 style={{ margin: '0 0 1rem 0' }}>Context & Concept</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>{fail.context}</p>

                    <h3 style={{ margin: '1.5rem 0 1rem 0' }}>The Wrong Assumption</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>{fail.wrong_assumption}</p>

                    <h3 style={{ margin: '1.5rem 0 1rem 0' }}>Lesson Learned</h3>
                    <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                      <p style={{ margin: 0, color: 'var(--text-primary)' }}>{fail.lesson_learned}</p>
                    </div>

                    <div style={{ marginTop: '1.5rem' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Prevention Actions Checklist</h4>
                      <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                        {fail.prevention_checklist.map((item, idx) => (
                          <li key={idx} style={{ padding: '0.25rem 0' }}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
          
          {activeTab === 'suggestions' && (
            mySuggestions.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <MessageSquare size={24} color="rgba(255,255,255,0.5)" />
                </div>
                <h3 style={{ margin: '0 0 0.5rem' }}>No Suggestions Posted</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Suggestions you post will appear here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {mySuggestions.map(sug => (
                  <div key={sug.id} className="glass-panel hover-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                      <button className="icon-btn" onClick={() => handleEditSuggestionToggle(sug)} title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button className="icon-btn" onClick={() => handleDeleteSuggestion(sug.id)} title="Delete" style={{ color: 'var(--error)' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <h3 style={{ margin: '0 0 1rem 0' }}>{sug.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', paddingRight: '4rem' }}>{sug.description}</p>
                    
                    <div style={{ display: 'inline-flex', padding: '0.25rem 0.75rem', background: 'rgba(79, 70, 229, 0.2)', color: 'var(--primary)', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, marginTop: '1rem', alignItems: 'center', gap: '0.25rem' }}>
                      <ThumbsUp size={14} /> {sug.votes_count} Upvotes
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
        
      </div>
      
      <EditPostModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSubmit={handleEditSubmit} 
        post={editingPost} 
      />

      <EditInnovationModal
        isOpen={isEditInnovationModalOpen}
        onClose={() => setIsEditInnovationModalOpen(false)}
        onSubmit={handleEditInnovationSubmit}
        innovation={editingInnovation}
      />

      <EditFailureModal
        isOpen={isEditFailureModalOpen}
        onClose={() => setIsEditFailureModalOpen(false)}
        onSubmit={handleEditFailureSubmit}
        failure={editingFailure}
      />
    </LayoutWrapper>
  );
}
