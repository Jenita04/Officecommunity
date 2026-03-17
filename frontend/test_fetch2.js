// test_fetch2.js
const API_URL = 'https://kt-backend-upfd.onrender.com/api';

async function testFetch() {
  try {
    const res = await fetch(`${API_URL}/feed/undefined/comments/1/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution_status: "RESOLVED" })
    });
    console.log("Status:", res.status);
    console.log("Body:", await res.text());
  } catch(err) {
    console.error("Fetch failed!", err.message);
  }
}

testFetch();
