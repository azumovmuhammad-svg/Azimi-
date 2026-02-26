// feed.js

let currentPage = 0;
let isLoading = false;
let currentCategory = 'all';
let allPosts = [];

document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM loaded - Azimi Feed");

  // Load categories from static folder
  renderStaticCategories();

  // PULL TO REFRESH
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
      pullRefresh.classList.add('show');
      setTimeout(() => {
        reloadFeed();
        pullRefresh.classList.remove('show');
      }, 1000);
    }
  }

  // Profile icon
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

  // SHORTS button
  const shortsBtn = document.getElementById("shorts-btn");
  if (shortsBtn) {
    shortsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (!window.IS_LOGGED_IN) {
        showLoginPrompt();
        return;
      }
      window.location.href = "/shorts";
    });
  }

  // Navigation
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

  // Load initial feed
  loadFeed();
});

// ⭐ Render Static Categories from /static/uploads/categories
function renderStaticCategories() {
  // Тоза кардани категорияҳои кӯҳна
  const oldContainer = document.querySelector('.categories-container');
  if (oldContainer) oldContainer.remove();

  // Маълумоти категорияҳо (ном ва ID)
  const categories = [
    { id: 'nedvizhimost', name: 'Недвижимость', icon: '/static/uploads/categories/nedvizhimost.png' },
    { id: 'avto', name: 'Авто', icon: '/static/uploads/categories/avto.png' },
    { id: 'elektronika', name: 'Электроника', icon: '/static/uploads/categories/elektronika.png' },
    { id: 'aksessuary', name: 'Аксессуары', icon: '/static/uploads/categories/aksessuary.png' },
    { id: 'uslugi', name: 'Услуги', icon: '/static/uploads/categories/uslugi.png' },
    { id: 'dom', name: 'Для дома', icon: '/static/uploads/categories/dom.png' },
    { id: 'rabota', name: 'Работа', icon: '/static/uploads/categories/rabota.png' },
    { id: 'biznes', name: 'Бизнес', icon: '/static/uploads/categories/biznes.png' },
    { id: 'odezhda', name: 'Одежда', icon: '/static/uploads/categories/odezhda.png' },
    { id: 'all', name: 'Все', icon: '/static/uploads/categories/all.png' }
  ];

  // Ба ду рада тақсим кардан
  const half = Math.ceil(categories.length / 2);
  const firstRow = categories.slice(0, half);
  const secondRow = categories.slice(half);

  // Эҷоди контейнери нав
  const container = document.createElement('div');
  container.className = 'categories-container';

  const scrollDiv = document.createElement('div');
  scrollDiv.className = 'categories-scroll';
  scrollDiv.id = 'categoryScroll';

  // Ради аввал
  const row1 = document.createElement('div');
  row1.className = 'category-row';
  firstRow.forEach(cat => {
    const item = createCategoryElement(cat);
    row1.appendChild(item);
  });
  scrollDiv.appendChild(row1);

  // Ради дуюм
  const row2 = document.createElement('div');
  row2.className = 'category-row';
  secondRow.forEach(cat => {
    const item = createCategoryElement(cat);
    row2.appendChild(item);
  });
  scrollDiv.appendChild(row2);

  container.appendChild(scrollDiv);

  // Илова ба DOM пас аз top header
  const topHeader = document.querySelector('.top');
  if (topHeader) {
    topHeader.insertAdjacentElement('afterend', container);
  }

  // Скролли ҳамвор
  setupCategoryScroll();

  // Аввал "Все" -ро active кунед
  const allCategory = document.querySelector('[data-cat="all"]');
  if (allCategory) {
    allCategory.classList.add('active');
    currentCategory = 'all';
  }

  // CATEGORY FILTER (барои категорияҳои нав)
  const categoryItems = document.querySelectorAll('.category-item');
  console.log("Found category items:", categoryItems.length);

  categoryItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();

      const category = this.dataset.cat;
      console.log("Category clicked:", category);

      // Remove active from all
      categoryItems.forEach(c => c.classList.remove('active'));

      // Add active to clicked
      this.classList.add('active');

      // Update current category
      currentCategory = category;

      // Filter posts
      filterPosts(category);
    });
  });
}

// Эҷоди элементи категория
function createCategoryElement(cat) {
  const item = document.createElement('div');
  item.className = 'category-item';
  item.dataset.cat = cat.id;

  item.innerHTML = `
    <div class="cat-icon" style="background-image: url('${cat.icon}');"></div>
    <span>${cat.name}</span>
  `;

  return item;
}

// Скролли ҳамвор
function setupCategoryScroll() {
  const categoryScroll = document.getElementById('categoryScroll');
  if (categoryScroll) {
    categoryScroll.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        categoryScroll.scrollLeft += e.deltaY * 2;
      }
    }, { passive: false });
  }
}

// FILTER POSTS FUNCTION
function filterPosts(category) {
  console.log("Filtering posts for category:", category);
  const cards = document.querySelectorAll('.card');
  let visibleCount = 0;

  cards.forEach(card => {
    const cardCategory = card.dataset.category;

    if (category === 'all' || cardCategory === category) {
      card.style.display = 'block';
      card.style.opacity = '1';
      card.style.transform = 'scale(1)';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  // Handle shorts visibility (only show in 'all' category)
  const shortsWrappers = document.querySelectorAll('.shorts-wrapper');
  shortsWrappers.forEach(wrapper => {
    if (category === 'all') {
      wrapper.style.display = 'block';
    } else {
      wrapper.style.display = 'none';
    }
  });

  // No posts message
  const feedContainer = document.querySelector(".feed");
  let noPostsMsg = document.querySelector('.no-posts-message');

  if (visibleCount === 0 && category !== 'all') {
    if (!noPostsMsg) {
      noPostsMsg = document.createElement('div');
      noPostsMsg.className = 'no-posts-message';
      noPostsMsg.style.cssText = 'grid-column: 1/-1; text-align: center; padding: 40px; color: #9bb8d0; font-size: 15px;';
      noPostsMsg.textContent = 'Дар ин категория постҳо нест';
      feedContainer.appendChild(noPostsMsg);
    }
  } else {
    if (noPostsMsg) {
      noPostsMsg.remove();
    }
  }

  console.log(`Visible posts: ${visibleCount}`);
}

// RELOAD FEED
async function reloadFeed() {
  const feedContainer = document.querySelector(".feed");
  feedContainer.innerHTML = `
    <div class="skeleton-card"><div class="skeleton-img"></div><div class="skeleton-text"></div></div>
    <div class="skeleton-card"><div class="skeleton-img"></div><div class="skeleton-text"></div></div>
    <div class="skeleton-card"><div class="skeleton-img"></div><div class="skeleton-text"></div></div>
    <div class="skeleton-card"><div class="skeleton-img"></div><div class="skeleton-text"></div></div>
  `;
  await loadFeed();
}

// SHOW LOGIN PROMPT
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

// START NEW POST
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

async function loadFeed() {
  const feedContainer = document.querySelector(".feed");
  const mainContainer = document.querySelector("main") || document.body;

  console.log("Loading feed...");

  try {
    const res = await fetch("/auth/feed-data", {
      method: "GET",
      credentials: "include",
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) throw new Error("Не удалось загрузить ленту");

    const data = await res.json();
    console.log("Feed data received:", data);

    // === VIP & СРОЧНО СЕКЦИЯ ===
    let promotedHtml = '';
    let hasPromoted = false;

    if (data.vip && data.vip.length > 0) {
      hasPromoted = true;
      promotedHtml += renderPromotedPosts(data.vip, 'vip');
    }

    if (data.urgent && data.urgent.length > 0) {
      hasPromoted = true;
      promotedHtml += renderPromotedPosts(data.urgent, 'urgent');
    }

    if (data.top && data.top.length > 0) {
      hasPromoted = true;
      promotedHtml += renderPromotedPosts(data.top, 'top');
    }

    // === МУҲИМ: VIP/Срочно-ро ПЕШ аз .feed гузор ===
    let existingPromoted = document.querySelector('.promoted-section');
    if (existingPromoted) existingPromoted.remove();

    if (hasPromoted) {
      const promotedSection = document.createElement('div');
      promotedSection.className = 'promoted-section';
      promotedSection.innerHTML = `
        <div class="promoted-header">
          <span class="promoted-label">🔥 Премиум объявления</span>
          <span style="font-size: 11px; color: #6f8a9c;">Свайп →</span>
        </div>
        <div class="promoted-scroll">
          ${promotedHtml}
        </div>
      `;

      // ПЕШ аз .feed гузоштан
      feedContainer.parentNode.insertBefore(promotedSection, feedContainer);
    }

    // === ПОСТҲОИ ОДДӢ ===
    feedContainer.innerHTML = "";  // Тоза кардан

    const regularPosts = data.regular || data.posts || [];
    allPosts = regularPosts;
    let postCount = 0;

    let likedPosts = [];
    if (window.IS_LOGGED_IN) {
      try {
        const likesRes = await fetch("/auth/user-likes", {
          credentials: "include"
        });
        if (likesRes.ok) {
          const likesData = await likesRes.json();
          likedPosts = likesData.liked_posts || [];
        }
      } catch (e) {
        console.log("Could not load likes");
      }
    }

    for (let i = 0; i < regularPosts.length; i++) {
      const post = regularPosts[i];
      const card = createPostCard(post, i, likedPosts);
      feedContainer.appendChild(card);
      postCount++;

      if (postCount === 4) {
        await addShortsCard(feedContainer, i);
        postCount = 0;
      }
    }

    if (regularPosts.length === 0 && !hasPromoted) {
      feedContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #9bb8d0;">Постов нет</div>';
    }

    if (currentCategory !== 'all') {
      filterPosts(currentCategory);
    }

  } catch (err) {
    console.error("Feed load error:", err);
    feedContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #9bb8d0;">Ошибка загрузки</div>';
  }
}


// === ФУНКСИЯИ НАВ: VIP/Срочно/Топ ===
function renderPromotedPosts(posts, type) {
  return posts.map(post => {
    const priceText = post.price ? post.price.toLocaleString() + ' ' + (post.currency || 'TJS') : 'Договорная';
    const location = [post.city, post.district].filter(Boolean).join(' · ') || 'Локация не указана';
    const imageUrl = post.image ? `/static/uploads/posts/${post.image}` : '/static/images/default.jpg';

    // Вақти боқимонда
    let timeLeft = '';
    if (post.time_left && post.time_left > 0) {
      const hours = Math.floor(post.time_left / 60);
      const minutes = post.time_left % 60;
      timeLeft = `⏱ ${hours}ч ${minutes}м`;
    }

    // Badge класс
    let badgeClass = '';
    let badgeText = '';
    if (type === 'vip') {
      badgeClass = 'vip-badge premium';
      badgeText = 'ПРЕМИУМ';
    } else if (type === 'urgent') {
      badgeClass = 'urgent-badge';
      badgeText = 'СРОЧНО';
    } else if (type === 'top') {
      badgeClass = 'top-badge';
      badgeText = 'ТОП';
    }

    return `
      <div class="${type}-card" onclick="openPost(${post.id})">
        <div class="${badgeClass}">${badgeText}</div>
        <div class="card-image-wrapper">
          <img src="${imageUrl}" alt="${type.toUpperCase()}" onerror="this.src='/static/images/default.jpg'">
          ${timeLeft ? `<div class="time-remaining">${timeLeft}</div>` : ''}
        </div>
        <div class="card-body">
          <div class="price">${priceText}</div>
          <div class="title">${post.title || 'Бе ном'}</div>
          <div class="meta">📍 ${location}</div>
        </div>
      </div>
    `;
  }).join('');
}

function openPost(id) {
  window.location.href = `/post/${id}`;
}

function createPostCard(post, index, likedPosts = []) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.category = post.category || 'all';
  card.dataset.postId = post.id;
  card.style.animationDelay = `${index * 0.05}s`;

  const priceText = post.price ? post.price.toLocaleString() + ' ' + (post.currency || 'TJS') : 'Договорная';
  const location = [post.city, post.district].filter(Boolean).join(', ') || 'Локация не указана';
  const imageUrl = post.image ? `/static/uploads/posts/${post.image}` : '/static/images/default.jpg';

  // Санҷед, ки оё ин пост лайк шудааст
  const isLiked = likedPosts.includes(post.id);
  const likeIcon = isLiked ? "favorite" : "favorite_border";
  const likedClass = isLiked ? "liked" : "";

  card.innerHTML = `
    <div class="card-image-wrapper">
      <img src="${imageUrl}" loading="lazy" onerror="this.src='/static/images/default.jpg'">
      <button class="like-btn ${likedClass}" onclick="toggleLike(event, ${post.id})">
        <span class="material-icons-outlined">${likeIcon}</span>
      </button>
    </div>
    <div class="card-body">
      <div class="price">${priceText}</div>
      <div class="title">${post.title || 'Бе ном'}</div>
      <div class="meta">
        <span class="material-icons-outlined" style="font-size: 14px;">location_on</span>
        ${location}
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

// ADD SHORTS CARD
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

    // Auto-play videos
    const videos = shortsWrapper.querySelectorAll("video");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.5 });

    videos.forEach(v => observer.observe(v));

  } catch (err) {
    console.log("Shorts load error:", err);
  }
}

// FORMAT VIEWS
function formatViews(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num;
}

// OPEN SHORTS
function openShorts(id) {
  window.location.href = `/shorts?id=${id}`;
}

// TOGGLE LIKE
async function toggleLike(event, postId) {
  event.stopPropagation();
  event.preventDefault();

  if (!window.IS_LOGGED_IN) {
    showLoginPrompt();
    return;
  }

  const btn = event.currentTarget;
  const icon = btn.querySelector("span");

  btn.classList.add("animating");
  setTimeout(() => btn.classList.remove("animating"), 400);

  try {
    const res = await fetch(`/auth/like/${postId}`, {
      method: "POST",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();

      if (data.liked) {
        icon.textContent = "favorite";
        btn.classList.add("liked");
      } else {
        icon.textContent = "favorite_border";
        btn.classList.remove("liked");
      }
    }
  } catch (e) {
    console.error("Like error:", e);
  }
}

// INFINITE SCROLL
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
    // Load more posts - можно добавить позже
  }
});

// EXPORT FUNCTIONS FOR GLOBAL SCOPE
window.toggleLike = toggleLike;
window.openShorts = openShorts;
window.startNewPost = startNewPost;
window.openPost = openPost;

