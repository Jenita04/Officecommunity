// test_fetch.js
const API_URL = 'https://kt-backend-upfd.onrender.com/api';
const postId = 1;
const commentId = 1;
const status = 'RESOLVED';

async function updateCommentStatus() {
  try {
    const res = await fetch(`${API_URL}/feed/${postId}/comments/${commentId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution_status: status })
    });
    console.log("Status:", res.status);
    console.log("Body:", await res.text());
  } catch(err) {
    console.error("Fetch failed!");
    console.error("Name:", err.name);
    console.error("Message:", err.message);
    console.error("Cause:", err.cause);
  }
}

updateCommentStatus();
