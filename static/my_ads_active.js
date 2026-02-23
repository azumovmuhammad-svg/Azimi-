document.addEventListener("DOMContentLoaded", async () => {
  initNavigation();
  initFilters();
  await loadActiveAds();
  await loadStats();
  await loadMyShorts();
});

function initNavigation() {
  document.querySelector(".back-btn").addEventListener("click", () => {
    window.location.href = "/auth/settings";
  });

  document.querySelector(".more-btn").addEventListener("click", () => {
    showMoreOptions();
  });
}

function initFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;
      filterAds(filter);
    });
  });
}

async function loadActiveAds() {
  const container = document.getElementById("adsContainer");
  const emptyState = document.getElementById("emptyState");

  // Show loading skeleton
  container.innerHTML = Array(3).fill(`
    <div class="ad-card">
      <div class="ad-image-container">
        <div class="skeleton" style="width: 100%; height: 100%;"></div>
      </div>
      <div class="ad-content">
        <div class="skeleton" style="width: 60%; height: 24px; margin-bottom: 8px;"></div>
        <div class="skeleton" style="width: 80%; height: 16px;"></div>
      </div>
    </div>
  `).join("");

  try {
    const res = await fetch("/auth/my-ads/active/data", {
      credentials: "include"
    });

    if (!res.ok) throw new Error("Failed to load");

    const data = await res.json();

    if (data.posts.length === 0) {
      container.style.display = "none";
      emptyState.style.display = "flex";
      return;
    }

    container.style.display = "flex";
    emptyState.style.display = "none";

    renderAds(data.posts);

  } catch (err) {
    console.error("Error loading ads:", err);
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <span class="material-icons-outlined">error_outline</span>
        </div>
        <h3>Ошибка загрузки</h3>
        <p>Не удалось загрузить объявления</p>
        <button class="create-ad-btn" onclick="location.reload()">
          <span class="material-icons-outlined">refresh</span>
          Повторить
        </button>
      </div>
    `;
  }
}

function renderAds(posts) {
  const container = document.getElementById("adsContainer");

  container.innerHTML = posts.map((post, index) => `
    <div class="ad-card" data-id="${post.id}" style="animation-delay: ${index * 0.1}s">
      <div class="ad-image-container">
        <img src="${post.image ? '/' + post.image : '/static/no-image.png'}"
             alt="${post.title}"
             class="ad-image"
             onerror="this.src='/static/no-image.png'">
        <span class="ad-badge">Активно</span>
        <div class="ad-stats-overlay">
          <div class="stat-pill">
            <span class="material-icons-outlined">visibility</span>
            ${post.views || 0}
          </div>
          <div class="stat-pill">
            <span class="material-icons-outlined">call</span>
            ${post.calls || 0}
          </div>
        </div>
      </div>

      <div class="ad-content">
        <div class="ad-price">${formatPrice(post.price, post.currency)}</div>
        <div class="ad-title">${escapeHtml(post.title)}</div>
        <div class="ad-location">
          <span class="material-icons-outlined">location_on</span>
          ${post.city}${post.district ? ', ' + post.district : ''}
        </div>
        <div class="ad-date">${formatDate(post.created_at)}</div>
      </div>

      <div class="ad-actions">
        <button class="ad-btn secondary" onclick="editAd(${post.id})">
          <span class="material-icons-outlined">edit</span>
          Изменить
        </button>
        <button class="ad-btn primary" onclick="promoteAd(${post.id})">
          <span class="material-icons-outlined">trending_up</span>
          Продвигать
        </button>
        <button class="ad-btn danger" onclick="archiveAd(${post.id})">
          <span class="material-icons-outlined">archive</span>
          В архив
        </button>
      </div>
    </div>
  `).join("");
}

async function loadStats() {
  try {
    const res = await fetch("/auth/my-posts-count", {
      credentials: "include"
    });

    if (res.ok) {
      const data = await res.json();
      document.getElementById("activeCount").textContent = data.active || 0;

      // Барои просмотр ва звонки мо бояд маълумоти воқеиро гирем
      // Агар API вуҷуд дошта бошад, онро истифода баред
      try {
        const statsRes = await fetch("/auth/my-ads/stats", {
          credentials: "include"
        });

        if (statsRes.ok) {
          const stats = await statsRes.json();
          document.getElementById("viewsCount").textContent = stats.views || 0;
          document.getElementById("callsCount").textContent = stats.calls || 0;
        } else {
          // Агар API набошад, ҷамъи маълумот аз постҳо
          const postsRes = await fetch("/auth/my-ads/active/data", {
            credentials: "include"
          });

          if (postsRes.ok) {
            const postsData = await postsRes.json();
            const totalViews = postsData.posts.reduce((sum, post) => sum + (post.views || 0), 0);
            const totalCalls = postsData.posts.reduce((sum, post) => sum + (post.calls || 0), 0);

            document.getElementById("viewsCount").textContent = totalViews;
            document.getElementById("callsCount").textContent = totalCalls;
          }
        }
      } catch (e) {
        console.log("Stats details not loaded");
      }
    }
  } catch (err) {
    console.log("Stats not loaded");
  }
}

function filterAds(filter) {
  const cards = document.querySelectorAll(".ad-card");

  cards.forEach((card, index) => {
    card.style.animation = "none";
    setTimeout(() => {
      card.style.animation = "slideUp 0.5s ease";
    }, index * 50);
  });
}

function editAd(id) {
  window.location.href = `/auth/edit-ad?id=${id}`;
}

function promoteAd(id) {
  // Show promotion modal or redirect
  alert("Функция продвижения скоро будет доступна!");
}

async function archiveAd(id) {
  if (!confirm("Переместить объявление в архив?")) return;

  try {
    const res = await fetch(`/auth/archive-post?id=${id}`, {
      method: "POST",
      credentials: "include"
    });

    if (res.ok) {
      const card = document.querySelector(`[data-id="${id}"]`);
      card.style.transform = "translateX(-100%)";
      card.style.opacity = "0";

      setTimeout(() => {
        card.remove();

        // Check if empty
        const remaining = document.querySelectorAll(".ad-card");
        if (remaining.length === 0) {
          location.reload();
        }
      }, 300);
    }
  } catch (err) {
    alert("Ошибка при архивировании");
  }
}

function showMoreOptions() {
  // Implement dropdown menu
  console.log("More options clicked");
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

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Только что";
  if (minutes < 60) return `${minutes} мин. назад`;
  if (hours < 24) return `${hours} ч. назад`;
  if (days < 30) return `${days} дн. назад`;

  return date.toLocaleDateString("ru-RU");
}

// ===== Функсияҳо барои shorts дар саҳифаи актив =====

async function loadMyShorts() {
  const container = document.getElementById('myShortsContainer');
  if (!container) return;

  try {
    const res = await fetch('/shorts/my-shorts', {
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) throw new Error('Failed to load');

    const data = await res.json();
    const shorts = data.shorts || [];

    if (shorts.length === 0) {
      container.innerHTML = `
        <div class="empty-short">
          <span class="material-icons-outlined">videocam_off</span>
          <p>У вас нет shorts</p>
          <button onclick="createShort()" class="btn-create-short">
            <span class="material-icons-outlined">add</span>
            Создать short
          </button>
        </div>
      `;
      return;
    }

    let html = '<div class="shorts-grid">';
    for (const short of shorts) {
      const statusClass = short.status === 'active' ? 'status-active' : 'status-draft';
      const statusText = short.status === 'active' ? 'Активно' : 'Черновик';

      html += `
        <div class="short-card">
          <div class="short-preview">
            <video src="${short.video_url}" muted loop playsinline></video>
            <div class="short-overlay-badge ${statusClass}">${statusText}</div>
            <div class="short-stats">
              <span class="material-icons-outlined">favorite</span>
              <span>${short.likes_count || 0}</span>
            </div>
            <div class="short-actions-overlay">
              <button onclick="playShort(${short.id})" class="btn-play">
                <span class="material-icons-outlined">play_arrow</span>
              </button>
            </div>
          </div>
          <div class="short-info">
            <h4 class="short-title">${escapeHtml(short.title || 'Без названия')}</h4>
            <p class="short-desc">${escapeHtml(short.description || '').substring(0, 50)}...</p>
            <div class="short-actions-btns">
              <button onclick="editShort(${short.id})" class="btn-short-edit">
                <span class="material-icons-outlined">edit</span>
              </button>
              <button onclick="deleteShort(${short.id})" class="btn-short-delete">
                <span class="material-icons-outlined">delete</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }
    html += '</div>';
    container.innerHTML = html;

    // Auto-play preview on hover
    setupShortPreviews();

  } catch (err) {
    console.error('Error loading shorts:', err);
    container.innerHTML = '<p class="error-text">Ошибка загрузки shorts</p>';
  }
}

function setupShortPreviews() {
  const videos = document.querySelectorAll('.short-preview video');
  videos.forEach(video => {
    const card = video.closest('.short-card');
    card.addEventListener('mouseenter', () => video.play().catch(() => {}));
    card.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
    });
  });
}

function playShort(id) {
  window.location.href = `/shorts?play=${id}`;
}

function editShort(id) {
  window.location.href = `/shorts/edit/${id}`;
}

async function deleteShort(id) {
  // Тафтиши ID
  if (!id || id === undefined || id === 'undefined') {
    console.error('Invalid short ID:', id);
    showToast('Ошибка: неверный ID');
    return;
  }

  if (!confirm('Удалить этот short?')) return;

  try {
    const res = await fetch(`/shorts/delete/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (res.ok) {
      showToast('Short удален');
      loadMyShorts(); // Reload
    } else {
      const errorText = await res.text();
      console.error('Delete error:', errorText);
      showToast('Ошибка удаления');
    }
  } catch (err) {
    console.error('Network error:', err);
    showToast('Ошибка сети');
  }
}


function createShort() {
  window.location.href = '/auth/add-selection?post_id=0';
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

