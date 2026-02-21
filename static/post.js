document.addEventListener("DOMContentLoaded", async () => {
  const postId = location.pathname.split("/").pop();

  try {
    const res = await fetch(`/api/post/${postId}`);
    if (!res.ok) throw new Error("Post not found");

    const post = await res.json();
    renderPost(post);

  } catch (err) {
    console.error("Error loading post:", err);
    document.getElementById("postTitle").textContent = "Ошибка загрузки";
  }
});

function renderPost(post) {
  // === МУҲИМ: Нигоҳ доштани user_id барои чат ===
  window.currentPostSellerId = post.user_id;
  window.currentPostId = post.id;
  window.currentPostTitle = post.title;

  // Title
  document.getElementById("postTitle").textContent = post.title || "Без названия";

  // Price
  const priceText = post.price ? `${parseInt(post.price).toLocaleString()} ${post.currency || "TJS"}` : "Договорная";
  document.getElementById("priceMain").textContent = priceText;

  // Location
  const locationText = [post.city, post.district].filter(Boolean).join(" · ");
  document.getElementById("postLocation").textContent = locationText || "Локация не указана";

  // Time
  document.getElementById("postTime").textContent = "Сегодня в " + new Date().toLocaleTimeString("ru-RU", {hour: "2-digit", minute: "2-digit"});

  // Description
  document.getElementById("postDescription").textContent = post.description || "Описание отсутствует";

  // Атрибутҳо
  renderAttributes(post);

  // Call button
  document.getElementById("callBtn").href = `tel:${post.phone || post.user?.phone || ""}`;

  // Seller info
  document.getElementById("sellerName").textContent = post.contact_name || post.user?.name || "Продавец";
  document.getElementById("sellerPhone").textContent = post.phone || post.user?.phone || "Телефон не указан";
  if (post.user?.avatar) {
    document.getElementById("sellerAvatar").src = post.user.avatar;
  }

  // Gallery
  renderGallery(post.images || []);
}


// === ИЛОВА: Функсияи нави атрибутҳо ===
function renderAttributes(post) {
  const container = document.getElementById("attributesContainer");
  if (!container) return;

  // Аз attributes (агар API фиристода бошад)
  let attrs = post.attributes || {};

  // Агар attributes холӣ бошад, аз description парс кун
  if (Object.keys(attrs).length === 0 && post.description) {
    attrs = parseAttributesFromDescription(post.description);
  }

  // Номҳои зебо барои атрибутҳо
  const labels = {
    brand: "Марка",
    model: "Модель",
    condition: "Состояние",
    memory: "Память",
    color: "Цвет",
    screen_size: "Диагональ",
    ram: "ОЗУ",
    storage: "Накопитель",
    year: "Год выпуска",
    body_type: "Кузов",
    engine: "Двигатель",
    transmission: "Коробка",
    drive: "Привод",
    mileage: "Пробег",
    rooms: "Комнат",
    area: "Площадь",
    floor: "Этаж",
    building_type: "Тип дома",
    material: "Материал",
    land_area: "Площадь участка",
    floors: "Этажность",
    purpose: "Назначение",
    communications: "Коммуникации",
    type: "Тип",
    connection: "Подключение",
    capacity: "Грузоподъемность",
    category: "Категория"
  };

  // Филтр кун танҳо агар арзиш дошта бошад
  const entries = Object.entries(attrs).filter(([key, value]) => value && value.toString().trim() !== "");

  if (entries.length === 0) {
    container.style.display = "none";
    return;
  }

  container.style.display = "block";
  container.innerHTML = entries.map(([key, value]) => `
    <div class="attribute-item">
      <span class="attribute-label">${labels[key] || key}</span>
      <span class="attribute-value">${value}</span>
    </div>
  `).join("");
}

// === ИЛОВА: Парс кардани атрибутҳо аз description ===
function parseAttributesFromDescription(description) {
  const attrs = {};
  if (!description) return attrs;

  // Ҷустуҷӯи қисми "---"
  const parts = description.split("---");
  if (parts.length < 2) return attrs;

  const attrsText = parts[1];
  const lines = attrsText.trim().split("\n");

  lines.forEach(line => {
    if (line.includes(":")) {
      const [key, ...valueParts] = line.split(":");
      const value = valueParts.join(":").trim();
      if (key && value) {
        // Табдили key ба формати стандартӣ
        const cleanKey = key.trim().toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[()]/g, "");
        attrs[cleanKey] = value;
      }
    }
  });

  return attrs;
}

function renderGallery(images) {
  const container = document.getElementById("galleryContainer");
  const counter = document.getElementById("galleryCounter");
  const dotsContainer = document.getElementById("galleryDots");

  if (images.length === 0) {
    container.innerHTML = `
      <div class="gallery-slide">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 16px; color: #64b5f6;">
          <span class="material-icons-outlined" style="font-size: 64px; opacity: 0.5;">image_not_supported</span>
          <span>Нет фото</span>
        </div>
      </div>
    `;
    counter.textContent = "0 / 0";
    return;
  }

  container.innerHTML = images.map((img, i) => `
    <div class="gallery-slide">
      <img src="${img}" alt="Фото ${i + 1}" onerror="this.src='/static/no-image.svg'">
    </div>
  `).join("");

  dotsContainer.innerHTML = images.map((_, i) => `
    <div class="gallery-dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})"></div>
  `).join("");

  let currentSlide = 0;
  counter.textContent = `1 / ${images.length}`;

  let startX = 0;
  container.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });

  container.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentSlide < images.length - 1) {
        currentSlide++;
      } else if (diff < 0 && currentSlide > 0) {
        currentSlide--;
      }
      updateGallery(currentSlide);
    }
  });

  window.goToSlide = (index) => {
    currentSlide = index;
    updateGallery(currentSlide);
  };

  function updateGallery(index) {
    container.style.transform = `translateX(-${index * 100}%)`;
    counter.textContent = `${index + 1} / ${images.length}`;

    document.querySelectorAll('.gallery-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }
}

function toggleFavorite() {
  const btn = document.querySelector('.favorite-btn');
  btn.classList.toggle('active');
  const icon = btn.querySelector('span');
  icon.textContent = btn.classList.contains('active') ? 'favorite' : 'favorite_border';
}

function sharePost() {
  if (navigator.share) {
    navigator.share({
      title: document.getElementById('postTitle').textContent,
      url: window.location.href
    });
  } else {
    alert('Ссылка скопирована!');
  }
}

// === ИСЛОҲ: Функсияи openChat бо фиристодани FormData ===
async function openChat() {
  // === ЛОГ барои диагностика ===
  console.log("DEBUG: currentPostSellerId =", window.currentPostSellerId);
  console.log("DEBUG: currentPostId =", window.currentPostId);

  const sellerId = window.currentPostSellerId;
  const postId = window.currentPostId;

  if (!sellerId) {
    alert("Ошибка: продавец не найден (sellerId is undefined)");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("seller_id", sellerId);
    if (postId) {
      formData.append("post_id", postId);
    }

    const res = await fetch("/chat/start", {
      method: "POST",
      credentials: "include",
      body: formData
    });

    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to start chat");
    }

    const data = await res.json();

    // Гузариш ба чат
    window.location.href = `/chat?user=${data.seller_id}&peer=${data.seller_id}`;

  } catch (err) {
    console.error("Chat start error:", err);
    alert("Ошибка: " + err.message);
  }
}

function buyNow() {
  alert('Функция покупки в разработке!');
}

