const GITHUB_USERNAME = 'usernamekamu';
const REPO_NAME = 'blog-github';
const POSTS_FILE = 'posts.json';
const SECRET_CODE = 'admkerenjir'; // Ganti dengan kode rahasia kamu!

// GitHub Token (buat di Settings > Developer settings > Personal access tokens)
// Token perlu izin: repo (full control)
let GITHUB_TOKEN = 'github_pat_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'; // Ganti dengan token asli kamu

async function verifyCode() {
    const code = document.getElementById('secretCode').value;
    if (code === SECRET_CODE) {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        loadAdminPosts();
    } else {
        document.getElementById('errorMsg').innerText = 'Kode rahasia salah!';
    }
}

async function loadAdminPosts() {
    const response = await fetch(`https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/main/${POSTS_FILE}`);
    if (response.ok) {
        const posts = await response.json();
        displayAdminPosts(posts);
    } else {
        displayAdminPosts([]);
    }
}

function displayAdminPosts(posts) {
    const container = document.getElementById('adminPostList');
    if (posts.length === 0) {
        container.innerHTML = '<p>Belum ada artikel.</p>';
        return;
    }
    
    container.innerHTML = posts.map((post, index) => `
        <div class="blog-card">
            <h3>${escapeHtml(post.title)}</h3>
            <p><strong>Penulis:</strong> ${escapeHtml(post.author)}</p>
            <p><strong>Tanggal:</strong> ${post.date}</p>
            <button class="delete-btn" onclick="deletePost(${index})">Hapus Artikel</button>
        </div>
    `).join('');
}

async function savePostToGitHub(posts) {
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(posts, null, 2))));
    
    // Dapatkan SHA file jika sudah ada
    let sha = '';
    const fileCheck = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${POSTS_FILE}`, {
        headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
    });
    
    if (fileCheck.ok) {
        const data = await fileCheck.json();
        sha = data.sha;
    }
    
    const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${POSTS_FILE}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Update posts.json',
            content: content,
            sha: sha,
            branch: 'main'
        })
    });
    
    if (response.ok) {
        alert('Artikel berhasil disimpan!');
        loadAdminPosts();
    } else {
        const error = await response.json();
        alert('Gagal menyimpan: ' + error.message);
    }
}

document.getElementById('blogForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const subtitle = document.getElementById('subtitle').value;
    const content = document.getElementById('content').value;
    const date = new Date().toLocaleDateString('id-ID');
    
    // Ambil posts lama
    let existingPosts = [];
    const response = await fetch(`https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/main/${POSTS_FILE}`);
    if (response.ok) {
        existingPosts = await response.json();
    }
    
    const newPost = { title, author, subtitle, content, date };
    existingPosts.unshift(newPost); // Tambah di awal
    
    await savePostToGitHub(existingPosts);
    
    // Reset form
    document.getElementById('blogForm').reset();
});

async function deletePost(index) {
    if (confirm('Yakin hapus artikel ini?')) {
        const response = await fetch(`https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/main/${POSTS_FILE}`);
        const posts = await response.json();
        posts.splice(index, 1);
        await savePostToGitHub(posts);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}