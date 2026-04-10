// Ganti dengan username GitHub dan repository kamu
const GITHUB_USERNAME = 'usernamekamu';
const REPO_NAME = 'blog-github';
const POSTS_FILE = 'posts.json';

const API_URL = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/main/${POSTS_FILE}`;

async function fetchPosts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Belum ada artikel');
        const posts = await response.json();
        return posts;
    } catch (error) {
        return [];
    }
}

function renderPosts(posts) {
    const blogList = document.getElementById('blogList');
    
    if (posts.length === 0) {
        blogList.innerHTML = '<div class="loading">📭 Belum ada artikel. Silakan cek lagi nanti.</div>';
        return;
    }

    blogList.innerHTML = posts.map(post => `
        <div class="blog-card">
            <h2>${escapeHtml(post.title)}</h2>
            <div class="meta">
                📅 ${post.date} | ✍️ ${escapeHtml(post.author)}
            </div>
            <div class="subtitle">${escapeHtml(post.subtitle)}</div>
            <div class="content">${escapeHtml(post.content).replace(/\n/g, '<br>')}</div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function searchBlog() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const allPosts = await fetchPosts();
    const filtered = allPosts.filter(post => 
        post.title.toLowerCase().includes(searchTerm)
    );
    renderPosts(filtered);
}

// Load initial posts
async function init() {
    const posts = await fetchPosts();
    renderPosts(posts);
}

init();