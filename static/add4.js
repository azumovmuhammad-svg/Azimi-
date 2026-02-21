// Store data between steps
const PostData = {
  // Step 1: Photos
  photos: [],

  // Step 2: Details
  title: '',
  category: '',
  subcategory: '',
  price: '',
  currency: 'TJS',
  negotiable: false,
  description: '',
  attributes: {},

  // Step 3: Contacts
  city: '',
  district: '',
  phone: '',
  contactName: '',
  telegram: '',
  showTelegram: false,
  allowMessages: true,
  bargain: false,

  // Load from sessionStorage
  load() {
    const saved = sessionStorage.getItem('post_data');
    if (saved) {
      Object.assign(this, JSON.parse(saved));
    }
  },

  // Save to sessionStorage
  save() {
    sessionStorage.setItem('post_data', JSON.stringify({
      photos: this.photos,
      title: this.title,
      category: this.category,
      subcategory: this.subcategory,
      price: this.price,
      currency: this.currency,
      negotiable: this.negotiable,
      description: this.description,
      attributes: this.attributes,
      city: this.city,
      district: this.district,
      phone: this.phone,
      contactName: this.contactName,
      telegram: this.telegram,
      showTelegram: this.showTelegram,
      allowMessages: this.allowMessages,
      bargain: this.bargain
    }));
  },

  // Clear all data
  clear() {
    sessionStorage.removeItem('post_data');
    sessionStorage.removeItem('post_id');
  }
};

let postId = null;
let currentSlide = 0;

document.addEventListener("DOMContentLoaded", () => {
  // Get post_id from URL
  const urlParams = new URLSearchParams(window.location.search);
  postId = urlParams.get("post_id");

  // Load saved data
  PostData.load();

  // === ИСЛОҲ: Агар PostData пурра бошад, аз сервер нахон ===
  if (!PostData.title || !PostData.city || !PostData.phone) {
    loadFromServer();
  } else {
    renderPreview();
  }
});

// Load data from server (if coming back to edit)
async function loadFromServer() {
  showLoading(true);

  try {
    const res = await fetch(`/auth/post/${postId}/preview`, {
      credentials: "include"
    });

    if (!res.ok) throw new Error("Failed to load");

    const data = await res.json();

    // === ИСЛОҲ: Танҳо агар дар PostData набошад, аз сервер бихон ===
    if (data.post) {
      if (!PostData.title) PostData.title = data.post.title || '';
      if (!PostData.price) PostData.price = data.post.price || '';
      if (!PostData.currency) PostData.currency = data.post.currency || 'TJS';
      PostData.negotiable = data.post.negotiable || false;
      if (!PostData.description) PostData.description = data.post.description || '';
      if (!PostData.city) PostData.city = data.post.city || '';
      if (!PostData.district) PostData.district = data.post.district || '';
      if (!PostData.category) PostData.category = data.post.category || '';
      if (!PostData.subcategory) PostData.subcategory = data.post.subcategory || '';
      
      // === МУҲИМ: Телефон ва контакт аз сервер ТАНҲО агар дар PostData набошанд ===
      if (!PostData.phone) PostData.phone = data.post.phone || '';
      if (!PostData.contactName) PostData.contactName = data.post.contact_name || '';
    }

    if (data.images && PostData.photos.length === 0) {
      PostData.photos = data.images.map(img => img.filename || img);
    }

    if (data.attributes && Object.keys(PostData.attributes).length === 0) {
      PostData.attributes = data.attributes;
    }

    PostData.save();
    renderPreview();

  } catch (err) {
    console.error("Error loading from server:", err);
    renderPreview();
  } finally {
    showLoading(false);
  }
}

function renderPreview() {
  // Render photos
  renderPhotos();

  // Render price
  renderPrice();

  // Render title
  document.getElementById("productTitle").textContent = PostData.title || "Без названия";

  // Render category
  renderCategory();

  // Render location
  renderLocation();

  // Render seller
  renderSeller();

  // Render description
  document.getElementById("descriptionText").textContent =
    PostData.description || "Описание отсутствует";

  // Render attributes
  renderAttributes();

  // Render contacts
  renderContacts();
}

function renderPhotos() {
  const container = document.getElementById("slidesContainer");
  const dotsContainer = document.getElementById("sliderDots");
  const counter = document.getElementById("sliderCounter");

  const photos = PostData.photos || [];

  if (photos.length === 0) {
    container.innerHTML = `
      <div class="slide">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 16px; color: var(--text-muted);">
          <span class="material-icons-outlined" style="font-size: 64px; opacity: 0.3;">image_not_supported</span>
          <span>Нет фото</span>
        </div>
      </div>
    `;
    counter.textContent = "0/0";
    dotsContainer.innerHTML = '';
    return;
  }

  container.innerHTML = photos.map((photo, i) => {
    const photoUrl = photo.startsWith('http') ? photo :
                     photo.startsWith('/') ? photo :
                     `/static/uploads/posts/${photo}`;
    return `
      <div class="slide">
        <img src="${photoUrl}" alt="Фото ${i + 1}"
             onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'display: flex; flex-direction: column; align-items: center; gap: 16px; color: var(--text-muted);\\'><span class=\\'material-icons-outlined\\' style=\\'font-size: 64px; opacity: 0.3;\\'>image_not_supported</span><span>Ошибка загрузки</span></div>'">
        <div class="slide-overlay"></div>
      </div>
    `;
  }).join("");

  dotsContainer.innerHTML = photos.map((_, i) => `
    <div class="dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})"></div>
  `).join("");

  counter.textContent = `1/${photos.length}`;

  // Swipe support
  let startX = 0;
  container.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  }, {passive: true});

  container.addEventListener("touchend", (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentSlide < photos.length - 1) {
        currentSlide++;
      } else if (diff < 0 && currentSlide > 0) {
        currentSlide--;
      }
      updateSlider();
    }
  }, {passive: true});
}

function renderPrice() {
  const priceValue = document.getElementById("priceValue");
  const priceCurrency = document.getElementById("priceCurrency");
  const priceNegotiable = document.getElementById("priceNegotiable");

  if (PostData.negotiable) {
    priceValue.style.display = "none";
    priceCurrency.style.display = "none";
    priceNegotiable.style.display = "inline-block";
    priceNegotiable.textContent = "Договорная";
  } else if (PostData.price) {
    priceValue.style.display = "inline";
    priceCurrency.style.display = "inline";
    priceNegotiable.style.display = "none";
    priceValue.textContent = parseInt(PostData.price).toLocaleString();
    priceCurrency.textContent = PostData.currency;
  } else {
    priceValue.textContent = "Цена не указана";
    priceCurrency.style.display = "none";
    priceNegotiable.style.display = "none";
  }
}

function renderCategory() {
  const badge = document.getElementById("categoryBadge");
  const text = document.getElementById("categoryText");

  const categoryNames = {
    electronics: "Электроника",
    cars: "Авто",
    realestate: "Недвижимость",
    phones: "Телефоны",
    laptops: "Ноутбуки",
    audio: "Аудио",
    cars_auto: "Легковые",
    trucks: "Грузовые",
    parts: "Запчасти",
    apartments: "Квартиры",
    houses: "Дома",
    land: "Участки"
  };

  const catName = categoryNames[PostData.subcategory] ||
                  categoryNames[PostData.category] ||
                  PostData.category ||
                  "Категория не выбрана";

  text.textContent = catName;
}

function renderLocation() {
  const locationText = [PostData.city, PostData.district]
    .filter(Boolean)
    .join(" · ");

  document.getElementById("locationText").textContent =
    locationText || "Локация не указана";
}

function renderSeller() {
  document.getElementById("sellerName").textContent =
    PostData.contactName || "Продавец";
}

function renderAttributes() {
  const container = document.getElementById("attributesGrid");
  const section = document.getElementById("attributesSection");

  const attrs = PostData.attributes || {};
  const entries = Object.entries(attrs).filter(([_, v]) => v);

  if (entries.length === 0) {
    section.style.display = "none";
    return;
  }

  section.style.display = "block";

  const labels = {
    brand: "Марка",
    model: "Модель",
    condition: "Состояние",
    memory: "Память",
    color: "Цвет",
    screen_size: "Экран",
    ram: "ОЗУ",
    storage: "Накопитель",
    year: "Год",
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
    land_area: "Участок",
    purpose: "Назначение"
  };

  container.innerHTML = entries.map(([key, value]) => `
    <div class="attribute-item">
      <div class="attribute-label">${labels[key] || key}</div>
      <div class="attribute-value">${value}</div>
    </div>
  `).join("");
}

function renderContacts() {
  const phoneEl = document.getElementById("contactPhone");
  const telegramEl = document.getElementById("contactTelegram");
  const telegramItem = document.getElementById("telegramItem");

  phoneEl.textContent = PostData.phone || "Не указан";

  if (PostData.telegram && PostData.showTelegram) {
    telegramItem.style.display = "flex";
    telegramEl.textContent = "@" + PostData.telegram.replace("@", "");
  } else {
    telegramItem.style.display = "none";
  }
}

function goToSlide(index) {
  currentSlide = index;
  updateSlider();
}

function updateSlider() {
  const container = document.getElementById("slidesContainer");
  const dots = document.querySelectorAll(".dot");
  const counter = document.getElementById("sliderCounter");
  const totalSlides = PostData.photos?.length || 0;

  if (totalSlides === 0) return;

  container.style.transform = `translateX(-${currentSlide * 100}%)`;

  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === currentSlide);
  });

  counter.textContent = `${currentSlide + 1}/${totalSlides}`;
}

function goToStep(step) {
  // Save current data before navigating
  PostData.save();

  const urls = {
    1: `/auth/add?post_id=${postId}`,
    2: `/auth/add2?post_id=${postId}`,
    3: `/auth/add3?post_id=${postId}`
  };
 
  window.location.href = urls[step] || "/feed";
}

async function publishPost() {
  const btn = document.getElementById("publishBtn");
  btn.disabled = true;
  btn.innerHTML = '<span class="material-icons-outlined">hourglass_top</span> Публикация...';

  showLoading(true);

  try {
    // === ИСЛОҲ: Танҳо маълумоти зарурӣ, бе spread operator ===
    const saveData = {
      post_id: postId,
      title: PostData.title,
      category: PostData.category,
      subcategory: PostData.subcategory,
      price: PostData.price,
      currency: PostData.currency,
      negotiable: PostData.negotiable,
      description: PostData.description,
      attributes: PostData.attributes,
      city: PostData.city,
      district: PostData.district,
      phone: PostData.phone,
      contact_name: PostData.contactName,
      telegram: PostData.telegram,
      show_telegram: PostData.showTelegram,
      allow_messages: PostData.allowMessages,
      bargain: PostData.bargain
    };

    // First save any pending data
    const saveRes = await fetch("/auth/post/save-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(saveData)
    });

    if (!saveRes.ok) {
      const errText = await saveRes.text();
      throw new Error(`Save failed: ${errText}`);
    }

    // Then publish
    const publishRes = await fetch("/auth/post/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ post_id: postId })
    });

    if (!publishRes.ok) {
      const errText = await publishRes.text();
      throw new Error(`Publish failed: ${errText}`);
    }

    // Clear saved data
    PostData.clear();

    // Show success
    showLoading(false);
    document.getElementById("successOverlay").classList.add("active");

  } catch (err) {
    console.error("Publish error:", err);
    showLoading(false);
    alert("Ошибка: " + err.message);
    btn.disabled = false;
    btn.innerHTML = '<span class="material-icons-outlined">send</span> Опубликовать';
  }
}

function showLoading(show) {
  document.getElementById("loadingOverlay").classList.toggle("active", show);
}

function viewPost() {
  window.location.href = `/post/${postId}`;
}

function sharePost() {
  if (navigator.share) {
    navigator.share({
      title: PostData.title,
      text: `Смотрите: ${PostData.title} за ${PostData.price} ${PostData.currency}`,
      url: window.location.origin + `/post/${postId}`
    });
  } else {
    // Copy to clipboard
    navigator.clipboard.writeText(window.location.origin + `/post/${postId}`);
    alert("Ссылка скопирована!");
  }
}

function goHome() {
  PostData.clear();
  window.location.href = "/feed";
}

// Auto-save on page hide
window.addEventListener("beforeunload", () => {
  PostData.save();
});

