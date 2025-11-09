async function fetchPosts(query = '') {
  let url = '/api/posts';
  const res = await fetch(url);
  const posts = await res.json();

  const container = document.getElementById('posts');
  container.innerHTML = '';

  const token = localStorage.getItem('jwt');

  const filtered = posts.filter(p =>
    p.author.toLowerCase().includes(query.toLowerCase()) ||
    p.content.toLowerCase().includes(query.toLowerCase())
  );

  filtered.forEach(p => {
    const div = document.createElement('div');
    div.className = 'post';
    div.innerHTML = `
      <div class="meta">#${p.id} - ${p.author} - ${new Date(p.date).toLocaleString()}</div>
      <div>${p.content}</div>
      ${token ? `
        <button class="editBtn" data-id="${p.id}">Edit</button>
        <button class="deleteBtn" data-id="${p.id}">Delete</button>
      ` : ''}
    `;
    container.appendChild(div);
  });

  if (token) {
    document.querySelectorAll('.deleteBtn').forEach(btn => {
      btn.onclick = async (e) => {
        const id = e.target.getAttribute('data-id');
        if (confirm('Delete this post?')) {
          await deletePost(id);
          fetchPosts();
        }
      };
    });

    document.querySelectorAll('.editBtn').forEach(btn => {
      btn.onclick = async (e) => {
        const id = e.target.getAttribute('data-id');
        const res = await fetch(`/api/posts/${id}`);
        const post = await res.json();
        document.getElementById('postId').value = post.id;
        document.getElementById('author').value = post.author;
        document.getElementById('content').value = post.content;
        document.getElementById('createBtn').style.display = 'none';
        document.getElementById('updateBtn').style.display = 'inline';
        window.scrollTo(0, 0);
      };
    });
  }
}

async function createPost() {
  const token = localStorage.getItem('jwt');
  const author = document.getElementById('author').value;
  const content = document.getElementById('content').value;
  const res = await fetch('/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ author, content })
  });
  if (res.ok) {
    resetForm();
    fetchPosts();
  } else {
    alert('Failed to create post');
  }
}

async function updatePost() {
  const token = localStorage.getItem('jwt');
  const id = document.getElementById('postId').value;
  const author = document.getElementById('author').value;
  const content = document.getElementById('content').value;

  const res = await fetch(`/api/posts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ author, content })
  });

  if (res.ok) {
    resetForm();
    fetchPosts();
  } else {
    alert('Failed to update post');
  }
}

async function deletePost(id) {
  const token = localStorage.getItem('jwt');
  const res = await fetch(`/api/posts/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });
  if (!res.ok) alert('Failed to delete post');
}

function resetForm() {
  document.getElementById('postId').value = '';
  document.getElementById('author').value = '';
  document.getElementById('content').value = '';
  document.getElementById('createBtn').style.display = 'inline';
  document.getElementById('updateBtn').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  fetchPosts();

  const token = localStorage.getItem('jwt');
  if (token) {
    document.getElementById('create-section').style.display = 'block';
    document.getElementById('logout').style.display = 'inline';
    document.getElementById('logout').onclick = () => {
      localStorage.removeItem('jwt');
      window.location = '/';
    };
  }

  document.getElementById('createBtn').onclick = createPost;
  document.getElementById('updateBtn').onclick = updatePost;

  document.getElementById('searchBox').oninput = (e) => {
    fetchPosts(e.target.value);
  };
});
