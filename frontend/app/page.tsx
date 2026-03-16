"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LayoutWrapper from '@/components/LayoutWrapper';
import PostCard from '@/components/PostCard';
import CreatePostModal from '@/components/CreatePostModal';
import { getPosts, createPost, Post } from '@/lib/api';
import { useUser } from '@/lib/UserContext';
import { ChevronRight, ChevronLeft } from 'lucide-react';

function HomeContent() {
  const searchParams = useSearchParams();
  const focusPostId = searchParams.get('postId');

  const [posts, setPosts] = useState<Post[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const fetchPosts = async () => {
    const data = await getPosts();
    
    if (focusPostId) {
      const targetId = parseInt(focusPostId);
      const index = data.findIndex(p => p.id === targetId);
      if (index > -1) {
        const [targetPost] = data.splice(index, 1);
        data.unshift(targetPost);
      }
    }
    
    // eslint-disable-next-line
    setPosts([...data]);
    
    if (focusPostId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusPostId]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setCanScrollLeft(target.scrollLeft > 0);
    setCanScrollRight(target.scrollWidth - target.clientWidth - target.scrollLeft > 1);
  };

  const scrollBy = (amount: number) => {
    const el = document.getElementById('filter-scroll-container');
    if (el) {
      el.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const { refreshUser } = useUser();

  const handleCreatePost = async (data: Record<string, unknown>) => {
    const newPost = await createPost(data);
    if (newPost) {
      setPosts([newPost, ...posts]);
      setIsModalOpen(false);
      await refreshUser();
    } else {
      alert("Failed to create post. Please check if the backend server is running and try again.");
    }
  };

  return (
    <LayoutWrapper>
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', paddingBottom: '3rem' }}>
        
        {/* Main Feed - Instagram Style (Centered Column) */}
        <div className="animate-fade-in" style={{ width: '100%', maxWidth: '600px' }}>
          
          {/* Create Post Header */}
          <div style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            marginBottom: '2rem', padding: '1.25rem 1.5rem', 
            background: 'linear-gradient(135deg, rgba(163, 0, 0, 0.05), rgba(163, 0, 0, 0.02))',
            border: '1px solid rgba(163, 0, 0, 0.1)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Create Post</h3>
              <p style={{ color: 'var(--text-secondary)', margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>Post anonymously or to your community.</p>
            </div>
            <button className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', borderRadius: 'var(--radius-full)' }} onClick={() => setIsModalOpen(true)}>
              Create Post
            </button>
          </div>
          
          {/* Filter Bar with Scroll Indicators */}
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            {canScrollLeft && (
              <button 
                onClick={() => scrollBy(-200)}
                style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 10,
                  background: 'linear-gradient(90deg, var(--background) 50%, transparent)',
                  border: 'none', color: 'var(--text-primary)', padding: '0.5rem 1rem 0.5rem 0',
                  cursor: 'pointer', display: 'flex', alignItems: 'center'
                }}
              >
                <div style={{ background: 'var(--surface)', borderRadius: '50%', padding: '0.2rem', display: 'flex', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                  <ChevronLeft size={16} />
                </div>
              </button>
            )}

            <div 
              id="filter-scroll-container"
              onScroll={handleScroll}
              style={{
                display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem',
                msOverflowStyle: 'none', scrollbarWidth: 'none', scrollBehavior: 'smooth'
              }} className="hide-scroll"
            >
              {['all', 'information', 'general', 'achievement', 'career growth doubts', 'technical help', 'kebs help'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  style={{
                    padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap',
                    fontSize: '0.85rem', fontWeight: 600, textTransform: 'capitalize',
                    background: filterType === type ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    color: filterType === type ? '#FFF' : 'var(--text-secondary)',
                    border: `1px solid ${filterType === type ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
                    transition: 'all 0.2s', cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  {type === 'all' ? 'All Posts' : type}
                </button>
              ))}
            </div>

            {canScrollRight && (
              <button 
                onClick={() => scrollBy(200)}
                style={{
                  position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 10,
                  background: 'linear-gradient(-90deg, var(--background) 50%, transparent)',
                  border: 'none', color: 'var(--text-primary)', padding: '0.5rem 0 0.5rem 1rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center'
                }}
              >
                <div style={{ background: 'var(--surface)', borderRadius: '50%', padding: '0.2rem', display: 'flex', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                  <ChevronRight size={16} />
                </div>
              </button>
            )}
          </div>
          
          {/* Feed Column */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {(() => {
              const filteredPosts = filterType === 'all' ? posts : posts.filter(p => p.type?.toLowerCase() === filterType);
              
              if (filteredPosts.length === 0) {
                return (
                  <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)', background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)' }}>
                    No posts found for this filter.
                  </div>
                );
              }
              
              return filteredPosts.map(post => <PostCard key={post.id} post={post} />);
            })()}
          </div>
          
        </div>
      </div>

      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreatePost} 
      />
    </LayoutWrapper>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading feed...</div>}>
      <HomeContent />
    </Suspense>
  );
}
