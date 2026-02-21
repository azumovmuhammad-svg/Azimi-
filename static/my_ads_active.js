document.addEventListener("DOMContentLoaded", async () => {
  initNavigation();
  initFilters();
  await loadActiveAds();
  await loadStats();
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

      // Mock data for views and calls (replace with real API)
      document.getElementById("viewsCount").textContent = Math.floor(Math.random() * 1000);
      document.getElementById("callsCount").textContent = Math.floor(Math.random() * 50);
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

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

