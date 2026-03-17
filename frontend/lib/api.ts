export const API_URL = 'https://kt-backend-upfd.onrender.com/api';

export interface Comment {
  id: number;
  content: string;
  created_at: string;
  author: { pseudo_name: string; reputation_score: number; is_verified?: boolean; };
  parent_id?: number;
  resolution_status?: string;
  replies?: Comment[];
}

export interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  post_id?: number;
  created_at: string;
}

// Post Types
export interface Post {
  id: number;
  title: string;
  description: string;
  tags: string;
  type?: string;
  media_url?: string;
  visibility: string;
  visibility_group?: string;
  created_at: string;
  author: { pseudo_name: string; reputation_score: number; is_verified?: boolean; };
  helpful_count: number;
  innovative_count: number;
  critical_count: number;
  is_solution_validated: boolean;
  comments: Comment[];
}

export interface Innovation {
  id: number;
  business_pain_point: string;
  proposed_solution_concept: string;
  expected_impact: string;
  scalability_potential: string;
  prototype_complexity: string;
  votes_count: number;
  status: string;
  author: { pseudo_name: string; reputation_score: number; is_verified?: boolean; };
  source_post_id?: number;
}

export interface Failure {
  id: number;
  context: string;
  wrong_assumption: string;
  impact_level: string;
  lesson_learned: string;
  prevention_checklist: string[];
  created_at: string;
  author: { pseudo_name: string; reputation_score: number; is_verified?: boolean; };
}

export interface Suggestion {
  id: number;
  title: string;
  description: string;
  votes_count: number;
  created_at: string;
  author: { pseudo_name: string; reputation_score: number; is_verified?: boolean; };
}

export interface Report {
  id: number;
  reporter_id: number;
  reported_item_type: string;
  reported_item_id: number;
  reported_user_id: number | null;
  reason: string;
  status: string;
  created_at: string;
  reporter?: { pseudo_name: string };
  reported_user?: { pseudo_name: string };
}

// Fetchers
const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export async function getPosts(): Promise<Post[]> {
  try {
    const res = await fetch(`${API_URL}/feed/`, { 
      next: { revalidate: 0 },
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function createPost(data: Record<string, unknown>): Promise<Post | null> {
  try {
    const res = await fetch(`${API_URL}/feed/`, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create post');
    return res.json();
  } catch(err) {
    console.error(err);
    return null;
  }
}

export async function getMyPosts(): Promise<Post[]> {
  try {
    const res = await fetch(`${API_URL}/users/profile/posts`, {
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error('Failed to fetch my posts');
    return res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getMyInnovations(): Promise<Innovation[]> {
  try {
    const res = await fetch(`${API_URL}/users/profile/innovations`, {
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error('Failed to fetch my innovations');
    return res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getTopInnovations(): Promise<Innovation[]> {
  try {
    const res = await fetch(`${API_URL}/innovations/top`, {
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error('Failed to fetch top innovations');
    return res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getMyFailures(): Promise<Failure[]> {
  try {
    const res = await fetch(`${API_URL}/users/profile/failures`, {
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error('Failed to fetch my failures');
    return res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function updatePost(id: number, data: Record<string, unknown>): Promise<Post | null> {
  try {
    const res = await fetch(`${API_URL}/feed/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update post');
    return res.json();
  } catch(err) {
    console.error(err);
    return null;
  }
}

export async function deletePost(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/feed/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() }
    });
    return res.ok;
  } catch(err) {
    console.error(err);
    return false;
  }
}

export async function updateInnovation(id: number, data: Record<string, unknown>): Promise<Innovation | null> {
  try {
    const res = await fetch(`${API_URL}/innovations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update innovation');
    return res.json();
  } catch(err) {
    console.error(err);
    return null;
  }
}

export async function deleteInnovation(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/innovations/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() }
    });
    return res.ok;
  } catch(err) {
    console.error(err);
    return false;
  }
}

export async function updateFailure(id: number, data: Record<string, unknown>): Promise<Failure | null> {
  try {
    const res = await fetch(`${API_URL}/failures/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update failure');
    return res.json();
  } catch(err) {
    console.error(err);
    return null;
  }
}

export async function deleteFailure(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/failures/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() }
    });
    return res.ok;
  } catch(err) {
    console.error(err);
    return false;
  }
}

export async function markFailureUseful(id: number): Promise<number | null> {
  try {
    const res = await fetch(`${API_URL}/failures/${id}/useful`, {
      method: 'POST',
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error('Failed to mark failure as useful');
    const data = await res.json();
    return data.useful_count;
  } catch (err) {
    console.error(err);
    return null;
  }
}

// Suggestions
export async function getSuggestions(): Promise<Suggestion[]> {
  try {
    const res = await fetch(`${API_URL}/suggestions/`, {
      next: { revalidate: 0 },
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error('Failed to fetch suggestions');
    return res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getTopSuggestions(): Promise<Suggestion[]> {
  try {
    const res = await fetch(`${API_URL}/suggestions/top`, {
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error('Failed to fetch top suggestions');
    return res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getMySuggestions(): Promise<Suggestion[]> {
  try {
    const res = await fetch(`${API_URL}/users/profile/suggestions`, {
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error('Failed to fetch my suggestions');
    return res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function createSuggestion(data: Record<string, unknown>): Promise<Suggestion | null> {
  try {
    const res = await fetch(`${API_URL}/suggestions/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create suggestion');
    return res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function upvoteSuggestion(id: number): Promise<number | null> {
  try {
    const res = await fetch(`${API_URL}/suggestions/${id}/upvote`, {
      method: 'POST',
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error('Failed to upvote suggestion');
    const data = await res.json();
    return data.votes_count;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function updateSuggestion(id: number, data: Record<string, unknown>): Promise<Suggestion | null> {
  try {
    const res = await fetch(`${API_URL}/suggestions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update suggestion');
    return res.json();
  } catch(err) {
    console.error(err);
    return null;
  }
}

export async function deleteSuggestion(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/suggestions/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() }
    });
    return res.ok;
  } catch(err) {
    console.error(err);
    return false;
  }
}

// Reports
export async function createReport(itemType: string, itemId: number, reason: string): Promise<Report | null> {
  try {
    const res = await fetch(`${API_URL}/reports/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({
        reported_item_type: itemType,
        reported_item_id: itemId,
        reason: reason
      })
    });
    if (!res.ok) throw new Error('Failed to create report');
    return res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getReports(): Promise<Report[]> {
  try {
    const res = await fetch(`${API_URL}/reports/`, {
      next: { revalidate: 0 },
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function updateReportStatus(id: number, status: string): Promise<Report | null> {
  try {
    const res = await fetch(`${API_URL}/reports/${id}/status?status_update=${status}`, {
      method: 'PUT',
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error('Failed to update report status');
    return res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function uploadMedia(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    const res = await fetch(`${API_URL}/feed/upload`, {
      method: 'POST',
      headers: { ...getAuthHeaders() }, // Content-Type is set automatically by fetch for FormData
      body: formData
    });
    
    if (!res.ok) throw new Error('Failed to upload media');
    const data = await res.json();
    return data.media_url;
  } catch(err) {
    console.error(err);
    return null;
  }
}

export async function createComment(postId: number, content: string, parentId?: number): Promise<Comment | null> {
  try {
    const res = await fetch(`${API_URL}/feed/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ content, parent_id: parentId })
    });
    if (!res.ok) throw new Error('Failed to create comment');
    return res.json();
  } catch(err) {
    console.error(err);
    return null;
  }
}

export async function likePost(postId: number): Promise<Post | null> {
  try {
    const res = await fetch(`${API_URL}/feed/${postId}/like`, { 
      method: 'POST',
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error('Failed to like post');
    return res.json();
  } catch(err) {
    console.error(err);
    return null;
  }
}

export async function updateCommentStatus(postId: number, commentId: number, status: string): Promise<Comment | null> {
  try {
    const res = await fetch(`${API_URL}/feed/${postId}/comments/${commentId}/resolve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ resolution_status: status })
    });
    if (!res.ok) throw new Error('Failed to update comment status');
    return res.json();
  } catch(err) {
    console.error(err);
    return null;
  }
}

export async function getLeaderboard(limit: number = 5): Promise<Record<string, unknown>[]> {
  try {
    const res = await fetch(`${API_URL}/users/leaderboard?limit=${limit}`, { 
      next: { revalidate: 0 },
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    return res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}
