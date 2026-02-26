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
  instagram: '',
  showInstagram: false,
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
      instagram: this.instagram,
      showInstagram: this.showInstagram,
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

  // Load from server if needed
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

      if (!PostData.phone) PostData.phone = data.post.phone || '';
      if (!PostData.contactName) PostData.contactName = data.post.contact_name || '';
      if (!PostData.telegram) PostData.telegram = data.post.telegram || '';
      if (!PostData.instagram) PostData.instagram = data.post.instagram || '';
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

  // Render price + category (зери акс)
  renderPriceCategory();

  // Render title
  document.getElementById("productTitle").textContent = PostData.title || "Без названия";

  // Render location
  const locationText = [PostData.city, PostData.district].filter(Boolean).join(" · ");
  document.getElementById("locationValue").textContent = locationText || "Локация не указана";

  // Render seller
  document.getElementById("sellerName").textContent = PostData.contactName || "Продавец";

  // Render description
  const rawDescription = PostData.description || "";
  const cleanDesc = rawDescription.split('---')[0].trim();
  document.getElementById("descriptionText").textContent = cleanDesc || "Описание отсутствует";

  // Render attributes
  renderAttributes();

  // Render contacts
  renderContacts();
}

// ФУНКСИЯИ НАВ: Price + Category дар як сатр
function renderPriceCategory() {
  const priceValue = document.getElementById("priceValueInline");
  const priceCurrency = document.getElementById("priceCurrencyInline");
  const categoryText = document.getElementById("categoryTextInline");

  // Category name
  const categoryNames = {
    realestate: "Недвижимость",
    apartments_sale: "Квартиры (продажа)",
    apartments_rent: "Квартиры (аренда)",
    houses_sale: "Дома (продажа)",
    houses_rent: "Дома (аренда)",
    land: "Участки",
    commercial: "Коммерческая",
    cars: "Авто",
    cars_sale: "Легковые (продажа)",
    cars_rent: "Авто (аренда)",
    trucks: "Грузовые",
    motorcycles: "Мотоциклы",
    parts: "Запчасти",
    electronics: "Электроника",
    phones: "Телефоны",
    laptops: "Ноутбуки",
    tablets: "Планшеты",
    audio: "Аудио",
    photo: "Фото/Видео",
    games: "Игры и приставки",
    accessories: "Аксессуары",
    watches: "Часы",
    bags: "Сумки и рюкзаки",
    jewelry: "Украшения",
    glasses: "Очки",
    services: "Услуги",
    repair: "Ремонт и обслуживание",
    beauty: "Красота и здоровье",
    education: "Обучение",
    cleaning: "Уборка",
    transport: "Грузоперевозки",
    home_garden: "Для дома",
    furniture: "Мебель",
    appliances: "Бытовая техника",
    dishes: "Посуда",
    decor: "Декор",
    garden: "Сад и огород",
    work: "Работа",
    vacancies: "Вакансии",
    resumes: "Резюме",
    business: "Бизнес",
    equipment: "Оборудование",
    furniture_office: "Офисная мебель",
    franchises: "Франшизы",
    business_sale: "Продажа бизнеса",
    clothes: "Одежда",
    women: "Женская",
    men: "Мужская",
    children: "Детская",
    shoes: "Обувь",
    accessories_clothes: "Аксессуары"
  };

  const catName = categoryNames[PostData.subcategory] ||
                  categoryNames[PostData.category] ||
                  PostData.category ||
                  "Категория";
  categoryText.textContent = catName;

  // Price
  if (PostData.negotiable) {
    priceValue.textContent = "Договорная";
    priceCurrency.style.display = "none";
  } else if (PostData.price) {
    priceValue.textContent = parseInt(PostData.price).toLocaleString();
    priceCurrency.textContent = PostData.currency || "TJS";
    priceCurrency.style.display = "inline";
  } else {
    priceValue.textContent = "Цена не указана";
    priceCurrency.style.display = "none";
  }
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
    color: "Цвет",
    year: "Год",
    rooms: "Комнат",
    area: "Площадь",
    floor: "Этаж",
    building_type: "Тип дома",
    material: "Материал",
    land_area: "Участок",
    purpose: "Назначение",
    heating: "Отопление",
    rent_period: "Срок аренды",
    furniture: "Мебель",
    communications: "Коммуникации",
    body_type: "Кузов",
    engine: "Двигатель",
    transmission: "Коробка",
    drive: "Привод",
    mileage: "Пробег",
    capacity: "Грузоподъемность",
    with_driver: "С водителем",
    memory: "Память",
    screen_size: "Экран",
    ram: "ОЗУ",
    storage: "Накопитель",
    connection: "Подключение",
    platform: "Платформа",
    profession: "Профессия",
    experience: "Опыт",
    employment: "Занятость",
    salary: "Зарплата",
    education: "Образование",
    type: "Тип",
    warranty: "Гарантия",
    specialist: "Специалист",
    subject: "Предмет",
    level: "Уровень",
    vehicle: "Транспорт",
    size: "Размер",
    gender: "Для кого",
    age: "Возраст",
    sphere: "Сфера",
    investment: "Инвестиции",
    revenue: "Выручка",
    metal: "Металл",
    gemstone: "Камень"
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
  const instagramEl = document.getElementById("contactInstagram");
  const instagramItem = document.getElementById("instagramItem");

  phoneEl.textContent = PostData.phone || "Не указан";

  if (PostData.telegram && PostData.showTelegram) {
    telegramItem.style.display = "flex";
    telegramEl.textContent = "@" + PostData.telegram.replace("@", "");
  } else {
    telegramItem.style.display = "none";
  }

  if (PostData.instagram && PostData.showInstagram) {
    instagramItem.style.display = "flex";
    instagramEl.textContent = "@" + PostData.instagram.replace("@", "");
  } else {
    instagramItem.style.display = "none";
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
  PostData.save();

  const urls = {
    1: `/auth/add?post_id=${postId}`,
    2: `/auth/add2?post_id=${postId}`,
    3: `/auth/add3?post_id=${postId}`
  };

  window.location.href = urls[step] || "/feed";
}

// === ИСЛОҲ: Функцияҳои алоҳида барои модал ва фаъолсозӣ ===

function openPromoteModal() {
  document.getElementById("promoteModal").classList.add("active");
}

function closePromote() {
  document.getElementById("promoteModal").classList.remove("active");
}

function selectPromote(type) {
  console.log("Selected promote type:", type);
  closePromote();
  // Баъд аз интихоб, фаъолсозӣ
  activatePromotion(type);
}

async function activatePromotion(type) {
  const btn = document.getElementById("publishBtn");

  try {
    const formData = new FormData();
    formData.append("post_id", postId);
    formData.append("promote_type", type);

    const res = await fetch("/auth/post/promote", {
      method: "POST",
      body: formData,
      credentials: "include"
    });

    if (!res.ok) throw new Error("Promote failed");

    const data = await res.json();

    // Нишон додани вақти боқимонда
    showPromoteStatus(type, data.ends_at);

    alert(`✅ ${type.toUpperCase()} активирован! Время: 6 часов`);

  } catch (err) {
    console.error(err);
    alert("Ошибка активации продвижения");
  }
}

// Нишон додани статус
function showPromoteStatus(type, endsAt) {
  // Хориҷ кардани badge-и кӯҳна агар вуҷуд дошта бошад
  const oldBadge = document.querySelector('.promote-status-badge');
  if (oldBadge) oldBadge.remove();

  const statusEl = document.createElement("div");
  statusEl.className = "promote-status-badge";
  statusEl.innerHTML = `
    <span class="promote-icon">${type === 'vip' ? '⭐' : type === 'urgent' ? '🔥' : '📌'}</span>
    <span class="promote-text">${type.toUpperCase()} активно</span>
    <span class="promote-timer" id="promoteTimer"></span>
  `;

  // Илова ба preview-card
  const previewCard = document.querySelector(".preview-card");
  if (previewCard) {
    previewCard.insertBefore(statusEl, previewCard.firstChild);
  }

  // Таймер
  startTimer(endsAt);
}

// Таймери вақти боқимонда
function startTimer(endsAt) {
  const timerEl = document.getElementById("promoteTimer");
  if (!timerEl) return;

  const updateTimer = () => {
    const now = new Date();
    const end = new Date(endsAt);
    const diff = end - now;

    if (diff <= 0) {
      timerEl.textContent = "Время истекло";
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    timerEl.textContent = `⏱ ${hours}ч ${minutes}м`;
  };

  updateTimer(); // Аввалан
  setInterval(updateTimer, 60000); // Ҳар дақиқа
}

async function publishPost() {
  const btn = document.getElementById("publishBtn");
  btn.disabled = true;
  btn.innerHTML = '<span class="material-icons-outlined">hourglass_top</span> Публикация...';

  showLoading(true);

  try {
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
      instagram: PostData.instagram,
      show_instagram: PostData.showInstagram,
      allow_messages: PostData.allowMessages,
      bargain: PostData.bargain
    };

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

    PostData.clear();
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
    navigator.clipboard.writeText(window.location.origin + `/post/${postId}`);
    alert("Ссылка скопирована!");
  }
}

function goHome() {
  PostData.clear();
  window.location.href = "/feed";
}

window.addEventListener("beforeunload", () => {
  PostData.save();
});

// Export for global scope
window.goToSlide = goToSlide;
window.goToStep = goToStep;
window.openPromoteModal = openPromoteModal;
window.closePromote = closePromote;
window.selectPromote = selectPromote;
window.publishPost = publishPost;
window.viewPost = viewPost;
window.sharePost = sharePost;
window.goHome = goHome;

