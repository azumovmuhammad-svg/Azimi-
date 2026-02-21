document.addEventListener("DOMContentLoaded", async () => {
  initNavigation();
  await loadArchivedAds();
  await loadStats();
});

function initNavigation() {
  document.querySelector(".back-btn").addEventListener("click", () => {
    window.location.href = "/auth/settings";
  });
}

async function loadArchivedAds() {
  const container = document.getElementById("adsContainer");
  const emptyState = document.getElementById("emptyState");

  // Show loading skeleton
  container.innerHTML = Array(3).fill(`
    <div class="ad-card">
      <div class="ad-image-container">
        <div class="skeleton" style="width: 100%; height: 100%;"></div>
      </div>
      <div class="ad-content">
        <div class="skeleton" style="width: 60%; height: 22px; margin-bottom: 8px;"></div>
        <div class="skeleton" style="width: 80%; height: 16px;"></div>
      </div>
    </div>
  `).join("");

  try {
    const res = await fetch("/auth/my-ads/archived/data", {
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
    console.error("Error loading archived ads:", err);
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <span class="material-icons-outlined">error_outline</span>
        </div>
        <h3>Ошибка загрузки</h3>
        <p>Не удалось загрузить архив</p>
        <button class="browse-btn" onclick="location.reload()">
          <span class="material-icons-outlined">refresh</span>
          Повторить
        </button>
      </div>
    `;
  }
}

function renderAds(posts) {
  const container = document.getElementById("adsContainer");
  const now = new Date();

  container.innerHTML = posts.map((post, index) => {
    const createdDate = new Date(post.created_at);
    const daysLeft = 30 - Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
    const isExpiring = daysLeft <= 3;

    return `
    <div class="ad-card ${isExpiring ? 'expiring-soon' : ''}" data-id="${post.id}" style="animation-delay: ${index * 0.1}s">
      <div class="ad-image-container">
        <img src="${post.image ? '/' + post.image : '/static/no-image.png'}"
             alt="${post.title}"
             class="ad-image"
             onerror="this.src='/static/no-image.png'">
        <span class="ad-badge ${isExpiring ? 'expiring' : ''}">
          ${isExpiring ? 'Истекает' : 'В архиве'}
        </span>
        <div class="ad-overlay">
          <div class="ad-overlay-text">
            <span class="material-icons-outlined">visibility</span>
            Просмотреть
          </div>
        </div>
      </div>

      <div class="ad-content">
        <div class="ad-price">${formatPrice(post.price, post.currency)}</div>
        <div class="ad-title">${escapeHtml(post.title)}</div>

        <div class="ad-meta">
          <div class="ad-meta-item">
            <span class="material-icons-outlined">location_on</span>
            ${post.city}
          </div>
          <div class="ad-meta-item">
            <span class="material-icons-outlined">schedule</span>
            ${daysLeft > 0 ? `${daysLeft} дн. осталось` : 'Истекает сегодня'}
          </div>
        </div>

        <div class="ad-date ${isExpiring ? 'expiring-soon' : ''}">
          <span class="material-icons-outlined">event</span>
          Архивировано: ${formatDate(post.created_at)}
        </div>
      </div>

      <div class="ad-actions">
        <button class="ad-btn primary" onclick="restoreAd(${post.id})">
          <span class="material-icons-outlined">restore</span>
          Восстановить
        </button>
        <button class="ad-btn secondary" onclick="viewAd(${post.id})">
          <span class="material-icons-outlined">visibility</span>
          Просмотр
        </button>
        <button class="ad-btn danger" onclick="deleteAd(${post.id})">
          <span class="material-icons-outlined">delete_forever</span>
        </button>
      </div>
    </div>
  `}).join("");
}

async function loadStats() {
  try {
    const res = await fetch("/auth/my-posts-count", {
      credentials: "include"
    });

    if (res.ok) {
      const data = await res.json();
      document.getElementById("archivedCount").textContent = data.archived || 0;
      document.getElementById("totalCount").textContent = (data.active || 0) + (data.archived || 0);

      // Calculate expiring (mock calculation - replace with real API)
      const expiring = Math.floor(Math.random() * (data.archived || 0));
      document.getElementById("expiringCount").textContent = expiring;
    }
  } catch (err) {
    console.log("Stats not loaded");
  }
}

async function restoreAd(id) {
  if (!confirm("Восстановить объявление? Оно станет активным.")) return;

  try {
    const res = await fetch(`/auth/restore-post?id=${id}`, {
      method: "POST",
      credentials: "include"
    });

    if (res.ok) {
      const card = document.querySelector(`[data-id="${id}"]`);
      card.style.transform = "translateX(100%)";
      card.style.opacity = "0";

      setTimeout(() => {
        card.remove();
        checkEmpty();
      }, 300);

      showNotification("Объявление восстановлено!", "success");
    }
  } catch (err) {
    showNotification("Ошибка при восстановлении", "error");
  }
}

async function deleteAd(id) {
  if (!confirm("Удалить объявление навсегда? Это действие нельзя отменить.")) return;

  try {
    const res = await fetch(`/auth/delete-post?id=${id}`, {
      method: "DELETE",
      credentials: "include"
    });

    if (res.ok) {
      const card = document.querySelector(`[data-id="${id}"]`);
      card.style.transform = "scale(0.9)";
      card.style.opacity = "0";

      setTimeout(() => {
        card.remove();
        checkEmpty();
      }, 300);

      showNotification("Объявление удалено", "success");
    }
  } catch (err) {
    showNotification("Ошибка при удалении", "error");
  }
}

function viewAd(id) {
  window.open(`/post/${id}`, '_blank');
}

function clearAllArchived() {
  // Create modal dynamically
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-icon">
        <span class="material-icons-outlined">delete_forever</span>
      </div>
      <div class="modal-title">Очистить архив?</div>
      <div class="modal-text">Все архивные объявления будут удалены навсегда. Это действие нельзя отменить.</div>
      <div class="modal-actions">
        <button class="modal-btn cancel" onclick="closeModal()">Отмена</button>
        <button class="modal-btn confirm" onclick="confirmClearAll()">Удалить все</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Trigger animation
  setTimeout(() => modal.classList.add('active'), 10);

  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

function closeModal() {
  const modal = document.querySelector('.modal-overlay');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
}

async function confirmClearAll() {
  try {
    const res = await fetch("/auth/clear-archived", {
      method: "DELETE",
      credentials: "include"
    });

    if (res.ok) {
      closeModal();
      document.getElementById("adsContainer").innerHTML = "";
      checkEmpty();
      showNotification("Архив очищен", "success");
    }
  } catch (err) {
    showNotification("Ошибка при очистке", "error");
  }
}

function checkEmpty() {
  const remaining = document.querySelectorAll(".ad-card");
  if (remaining.length === 0) {
    document.getElementById("adsContainer").style.display = "none";
    document.getElementById("emptyState").style.display = "flex";
  }
}

function showNotification(message, type) {
  // Simple notification implementation
  const notif = document.createElement('div');
  notif.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'success' ? '#4caf50' : '#f44336'};
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    font-weight: 600;
    z-index: 10000;
    animation: slideDown 0.3s ease;
  `;
  notif.textContent = message;
  document.body.appendChild(notif);

  setTimeout(() => {
    notif.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

function formatPrice(price, currency) {
  if (!price) return "Договорная";
  const symbol = currency === "TJS" ? "сом." : currency;
  return `${parseInt(price).toLocaleString()} ${symbol}`;
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Add keyframe animations dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from { transform: translate(-50%, -100%); opacity: 0; }
    to { transform: translate(-50%, 0); opacity: 1; }
  }
  @keyframes slideUp {
    from { transform: translate(-50%, 0); opacity: 1; }
    to { transform: translate(-50%, -100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

