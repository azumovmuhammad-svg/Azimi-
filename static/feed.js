// feed.js

let currentPage = 0;
let isLoading = false;
let currentCategory = 'all';

document.addEventListener("DOMContentLoaded", function() {

  // ⭐ PULL TO REFRESH
  let touchStartY = 0;
  let touchEndY = 0;
  const pullRefresh = document.getElementById('pullRefresh');

  document.addEventListener('touchstart', e => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', e => {
    touchEndY = e.changedTouches[0].clientY;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeDistance = touchEndY - touchStartY;
    if (swipeDistance > 150 && window.scrollY === 0) {
      // Pull down detected
      pullRefresh.classList.add('show');
      setTimeout(() => {
        shufflePosts();
        pullRefresh.classList.remove('show');
      }, 1000);
    }
  }

  // ⭐ CATEGORY FILTER
  const categoryItems = document.querySelectorAll('.category-item');
  categoryItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active from all
      categoryItems.forEach(c => c.classList.remove('active'));
      // Add active to clicked
      item.classList.add('active');
      // Filter
      currentCategory = item.dataset.cat;
      filterPosts(currentCategory);
    });
  });

  // --- Клик ба икони профил ---
  const profileIcon = document.querySelector(".top .material-icons-outlined.person");
  if (profileIcon) {
    profileIcon.addEventListener("click", () => {
      if (!window.IS_LOGGED_IN) {
        showLoginPrompt();
        return;
      }
      window.location.href = "/auth/settings";
    });
  }

  // Тугмаи SHORTS
  const shortsBtn = document.getElementById("shorts-btn");
  if (shortsBtn) {
    shortsBtn.addEventListener("click", () => {
      if (!window.IS_LOGGED_IN) {
        showLoginPrompt();
        return;
      }
      window.location.href = "/shorts";
    });
  }

  // Навигация
  const navItems = document.querySelectorAll(".bottom-nav .nav-item");
  navItems.forEach(item => {
    item.addEventListener("click", function(e) {
      if (this.classList.contains("add")) {
        e.preventDefault();
        if (!window.IS_LOGGED_IN) {
          showLoginPrompt();
          return;
        }
        startNewPost();
        return;
      }
    });
  });

  // Load initial
  loadFeed();
});

// ⭐ SHUFFLE POSTS (рефреш куни, ҷой иваз мекунанд)
function shufflePosts() {
  const feedContainer = document.querySelector(".feed");
  const cards = Array.from(feedContainer.querySelectorAll('.card'));

  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  // Re-append with animation
  cards.forEach((card, index) => {
    card.style.animation = 'none';
    setTimeout(() => {
      card.style.animation = `fadeInUp 0.5s ease ${index * 0.05}s`;
      feedContainer.appendChild(card);
    }, 10);
  });
}

// ⭐ FILTER POSTS
function filterPosts(category) {
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    if (category === 'all' || card.dataset.category === category) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

function showLoginPrompt() {
  let popup = document.createElement("div");
  popup.className = "login-popup";
  popup.innerHTML = `
    <div class="popup-content">
      <p>Барои идома додан, лутфан сабти ном кунед ё ворид шавед</p>
      <div class="popup-actions">
        <button class="btn-login">Ворид шудан</button>
        <button class="btn-cancel">Бекор</button>
      </div>
    </div>
  `;
  document.body.appendChild(popup);

  const style = document.createElement("style");
  style.innerHTML = `
    .login-popup {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      animation: fadeIn 0.3s;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .login-popup .popup-content {
      background: #0e1c2e;
      padding: 24px;
      border-radius: 16px;
      width: 80%;
      max-width: 320px;
      text-align: center;
      color: #fff;
      animation: slideUp 0.3s;
    }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .login-popup .popup-actions {
      margin-top: 20px;
      display: flex;
      justify-content: center;
      gap: 12px;
    }
    .login-popup button {
      flex: 1;
      padding: 12px;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
    }
    .btn-login { background: #1f6feb; color: #fff; }
    .btn-cancel { background: transparent; color: #888; border: 1px solid #444; }
  `;
  document.head.appendChild(style);

  popup.querySelector(".btn-login").addEventListener("click", () => {
    window.location.href = "/login";
  });
  popup.querySelector(".btn-cancel").addEventListener("click", () => {
    popup.remove();
  });
  popup.addEventListener("click", (e) => {
    if (e.target === popup) popup.remove();
  });
}

async function startNewPost() {
  try {
    const res = await fetch("/auth/post/create-draft", {
      method: "POST",
      credentials: "include"
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    window.location.href = `/auth/add-selection?post_id=${data.post_id}`;
  } catch (e) {
    console.error(e);
    alert("Ошибка создания объявления");
  }
}

// Дар feed.js - функцияи loadFeed-ро иваз кунед

async function loadFeed() {
  const feedContainer = document.querySelector(".feed");

  try {
    const res = await fetch("/auth/feed-data", { credentials: "include" });
    if (!res.ok) throw new Error("Не удалось загрузить ленту");

    const data = await res.json();
    feedContainer.innerHTML = "";

    const posts = data.posts || [];
    let postCount = 0;

    // Ҳар як пост + ҳар 4 пост shorts
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];

      // Постро илова кун
      const card = createPostCard(post, i);
      feedContainer.appendChild(card);
      postCount++;

      // ⭐ Агар 4 пост шуд, shorts илова кун (баъди 4-ум)
      if (postCount === 4) {
        await addShortsCard(feedContainer, i);
      }
    }

    // Агар постҳо кам бошанд, skeleton нест кун
    if (posts.length === 0) {
      feedContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #888;">Постов нет</div>';
    }

  } catch (err) {
    console.error(err);
    feedContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #888;">Ошибка загрузки</div>';
  }
}

// Функцияи createPostCard (ҳамон)
function createPostCard(post, index) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.category = post.category || 'all';
  card.dataset.postId = post.id;
  card.style.animationDelay = `${index * 0.05}s`;

  card.innerHTML = `
    <div class="card-image-wrapper">
      <img src="/static/uploads/posts/${post.image || 'default.png'}" loading="lazy">
      <button class="like-btn" onclick="toggleLike(event, ${post.id})">
        <span class="material-icons-outlined">favorite_border</span>
      </button>
    </div>
    <div class="card-body">
      <div class="price">
        ${post.price ? post.price.toLocaleString() + ' ' + post.currency : 'Договорная'}
      </div>
      <div class="title">${post.title}</div>
      <div class="meta">
        <span class="material-icons-outlined" style="font-size: 14px;">location_on</span>
        ${[post.city, post.district].filter(Boolean).join(', ') || 'Локация не указана'}
      </div>
    </div>
  `;

  card.addEventListener("click", (e) => {
    if (!e.target.closest('.like-btn')) {
      window.location.href = `/post/${post.id}`;
    }
  });

  return card;
}

// Shorts (ҳамон)
async function addShortsCard(container, index) {
  try {
    const res = await fetch("/shorts/shorts-data", {
      method: "GET",
      credentials: "include",
      headers: { "Accept": "application/json" }
    });

    if (!res.ok) throw new Error("Shorts not found");

    const data = await res.json();
    const shorts = data.shorts || [];

    if (shorts.length < 4) return;

    const shortsWrapper = document.createElement("div");
    shortsWrapper.className = "shorts-wrapper";
    shortsWrapper.style.gridColumn = "span 2";

    const fourShorts = shorts.slice(0, 4);

    let shortsHtml = '';
    fourShorts.forEach((short, i) => {
      const videoUrl = short.video_url || `/static/uploads/shorts/${short.video}`;

      shortsHtml += `
        <div class="shorts-item" onclick="openShorts(${short.id})" data-index="${i}">
          <video src="${videoUrl}" muted loop playsinline preload="metadata"></video>
          <div class="shorts-overlay">
            <span class="material-icons-outlined">play_arrow</span>
          </div>
          <div class="shorts-views">${formatViews(short.views || 0)}</div>
        </div>
      `;
    });

    shortsWrapper.innerHTML = `
      <div class="shorts-header">
        <span class="material-icons-outlined">play_circle</span>
        <span>Shorts</span>
      </div>
      <div class="shorts-grid">
        ${shortsHtml}
      </div>
    `;

    container.appendChild(shortsWrapper);

    // Auto-play
    const videos = shortsWrapper.querySelectorAll("video");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      });
    }, { threshold: 0.5 });

    videos.forEach(v => observer.observe(v));

  } catch (err) {
    console.log("Shorts load error:", err);
  }
}

function formatViews(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num;
}

function openShorts(id) {
  window.location.href = `/shorts?id=${id}`;
}


// Дар feed.js - toggleLike-ро иваз кунед

async function toggleLike(event, postId) {
  event.stopPropagation(); // Пешгирии клик ба кард

  if (!window.IS_LOGGED_IN) {
    showLoginPrompt();
    return;
  }

  const btn = event.currentTarget;
  const icon = btn.querySelector("span");

  // ⭐ Аниматсия
  btn.classList.add("animating");
  setTimeout(() => btn.classList.remove("animating"), 400);

  try {
    const res = await fetch(`/auth/like/${postId}`, {
      method: "POST",
      credentials: "include"
    });

    if (res.ok) {
      const data = await res.json();

      if (data.liked) {
        icon.textContent = "favorite"; // Дил пур
        btn.classList.add("liked");
      } else {
        icon.textContent = "favorite_border"; // Дил холӣ
        btn.classList.remove("liked");
      }
    }
  } catch (e) {
    console.error("Like error:", e);
  }
}


// ⭐ INFINITE SCROLL (опционально)
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
    // Load more posts
  }
});

