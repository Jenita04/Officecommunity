// test_fetch_auth.js
const API_URL = 'http://localhost:8000/api';
// We'll first login to get a token
async function run() {
  try {
    // 1. Get token
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "username=admin@kaartech.com&password=admin123"
    });
    const tokenData = await loginRes.json();
    const token = tokenData.access_token;
    console.log("Got token.");

    // 2. Fetch posts to find a post ID
    const postsRes = await fetch(`${API_URL}/feed/`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const posts = await postsRes.json();
    if(posts.length === 0) {
      console.log("No posts exist to test on!");
      return;
    }
    const post = posts[0];
    const postId = post.id;
    
    let commentId = null;
    if (post.comments.length > 0) {
      commentId = post.comments[0].id;
    } else {
      // Create a comment
      const cRes = await fetch(`${API_URL}/feed/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ content: "Testing resolution" })
      });
      const cObj = await cRes.json();
      commentId = cObj.id;
    }
    
    console.log(`Updating status for Post: ${postId}, Comment: ${commentId}`);

    // 3. Trigger the update status
    const updateRes = await fetch(`${API_URL}/feed/${postId}/comments/${commentId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ resolution_status: 'RESOLVED' })
    });
    
    console.log("Update Status:", updateRes.status);
    console.log("Update Body:", await updateRes.text());

  } catch (err) {
    console.error("Fetch failed!", err.message);
  }
}

run();
