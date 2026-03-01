document.addEventListener("DOMContentLoaded", async () => {
  await loadCounts();
  await loadAll();
});

let currentTab = 'all';
let favoritePosts = [];
let favoriteShorts = [];

async function loadCounts() {
  try {
    const res = await fetch("/favorite/counts", {
      credentials: "include"
    });

    if (res.ok) {
      const data = await res.json();
      document.getElementById('totalCount').textContent = data.total;
      document.getElementById('postsCount').textContent = data.posts_count;
      document.getElementById('shortsCount').textContent = data.shorts_count;
    }
  } catch (err) {
    console.error("Error loading counts:", err);
  }
}

async function loadAll() {
  await Promise.all([loadFavoritePosts(), loadFavoriteShorts()]);
  renderContent();
}

async function loadFavoritePosts() {
  try {
    const res = await fetch("/favorite/posts", {
      credentials: "include"
    });

    if (res.ok) {
      const data = await res.json();
      favoritePosts = data.posts || [];
    }
  } catch (err) {
    console.error("Error loading posts:", err);
    favoritePosts = [];
  }
}

async function loadFavoriteShorts() {
  try {
    const res = await fetch("/favorite/shorts", {
      credentials: "include"
    });

    if (res.ok) {
      const data = await res.json();
      favoriteShorts = data.shorts || [];
    }
  } catch (err) {
    console.error("Error loading shorts:", err);
    favoriteShorts = [];
  }
}

function switchTab(tab) {
  currentTab = tab;

  // Update UI
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

  renderContent();
}

function renderContent() {
  const container = document.getElementById('contentContainer');
  const emptyState = document.getElementById('emptyState');

  let items = [];

  if (currentTab === 'all') {
    items = [...favoritePosts, ...favoriteShorts];
    // Sort by date
    items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (currentTab === 'posts') {
    items = favoritePosts;
  } else if (currentTab === 'shorts') {
    items = favoriteShorts;
  }

  if (items.length === 0) {
    container.style.display = 'none';
    emptyState.style.display = 'flex';
    return;
  }

  container.style.display = 'flex';
  emptyState.style.display = 'none';

  container.innerHTML = items.map(item => {
    if (item.video) {
      // It's a short
      return renderShortCard(item);
    } else {
      // It's a post
      return renderPostCard(item);
    }
  }).join('');
}

// POST - уфуқӣ
function renderPostCard(post) {
  return `
    <div class="post-card" data-id="${post.id}" data-type="post">
      <div class="post-image-container">
        <img src="${post.image_url}" alt="${escapeHtml(post.title)}" class="post-image">
        <span class="post-badge">Объявление</span>
        <button class="post-remove" onclick="event.stopPropagation(); removeFavorite('post', ${post.id})">
          <span class="material-icons-outlined">close</span>
        </button>
      </div>
      <div class="post-content" onclick="viewPost(${post.id})">
        <div>
          <div class="post-price">${formatPrice(post.price, post.currency)}</div>
          <div class="post-title">${escapeHtml(post.title)}</div>
          <div class="post-location">
            <span class="material-icons-outlined">location_on</span>
            ${post.city || 'Не указано'}${post.district ? ', ' + post.district : ''}
          </div>
          <div class="post-date">${formatDate(post.created_at)}</div>
        </div>
        <div class="post-stats-bottom">
          <div class="stat-item-bottom">
            <span class="material-icons-outlined">visibility</span>
            <span>${post.views || 0}</span>
          </div>
          <div class="stat-item-bottom">
            <span class="material-icons-outlined">call</span>
            <span>${post.calls || 0}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// SHORT - уфуқӣ (ҳамон шакл)
function renderShortCard(short) {
  return `
    <div class="short-card" data-id="${short.id}" data-type="short">
      <div class="short-preview" onclick="playShort(${short.id})">
        ${short.video_url ? 
          `<video src="${short.video_url}" muted></video>
           <div class="short-play-icon">
             <span class="material-icons-outlined">play_arrow</span>
           </div>` :
          `<img src="/static/no-video.png" alt="no video">`
        }
        <button class="short-remove" onclick="event.stopPropagation(); removeFavorite('short', ${short.id})">
          <span class="material-icons-outlined">close</span>
        </button>
      </div>
      <div class="short-info" onclick="playShort(${short.id})">
        <div>
          <div class="short-header-info">
            <img src="${short.avatar || '/static/default-avatar.png'}" class="short-avatar">
            <span class="short-username">@${escapeHtml(short.username)}</span>
          </div>
          <div class="short-title">${escapeHtml(short.title || 'Без названия')}</div>
          <div class="short-desc">${escapeHtml(short.description || '').substring(0, 50)}...</div>
        </div>
        <div class="short-stats-bottom">
          <div class="stat-item-bottom">
            <span class="material-icons-outlined">favorite</span>
            <span>${short.total_likes || 0}</span>
          </div>
          <div class="stat-item-bottom">
            <span class="material-icons-outlined">visibility</span>
            <span>${short.views || 0}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Функсияҳо
function viewPost(id) {
  window.location.href = `/post/${id}`;
}

function playShort(id) {
  window.location.href = `/shorts?play=${id}`;
}

function formatPrice(price, currency) {
  if (!price) return "Договорная";
  const symbol = currency === "TJS" ? "сом." : currency;
  return `${parseInt(price).toLocaleString()} ${symbol}`;
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / 86400000);
  
  if (days < 1) return "Сегодня";
  if (days === 1) return "Вчера";
  if (days < 30) return `${days} дн. назад`;
  
  return date.toLocaleDateString("ru-RU");
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}


function showToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.8);
    color: #fff;
    padding: 12px 24px;
    border-radius: 24px;
    font-size: 14px;
    z-index: 1000;
    animation: fadeInUp 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

