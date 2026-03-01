let postId = null;
let currentSlide = 0;
let postData = {};

// Category names mapping
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

// Attribute labels
const attributeLabels = {
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

document.addEventListener("DOMContentLoaded", () => {
    // Get post_id from URL path (like /auth/my-ad/123)
    const pathParts = window.location.pathname.split('/');
    postId = pathParts[pathParts.length - 1];

    if (!postId || postId === 'my-ad') {
        alert("Ошибка: ID объявления не указан");
        window.location.href = "/auth/my-ads/active";
        return;
    }

    loadPostData();
});

// Load post data from server using public API
async function loadPostData() {
    showLoading(true);

    try {
        // Use the public API endpoint like post.js does
        const res = await fetch(`/api/post/${postId}`);

        if (!res.ok) {
            if (res.status === 404) {
                alert("Объявление не найдено");
                window.location.href = "/auth/my-ads/active";
                return;
            }
            throw new Error("Failed to load");
        }

        const post = await res.json();
        postData = post;

        renderPost(post);

    } catch (err) {
        console.error("Error loading post:", err);
        alert("Ошибка загрузки объявления");
    } finally {
        showLoading(false);
    }
}

// Render post data
function renderPost(post) {
    // Render photos
    renderPhotos(post.images || []);

    // Render price and category
    renderPriceCategory(post);

    // Render title
    document.getElementById("productTitle").textContent = post.title || "Без названия";

    // Render location
    const locationText = [post.city, post.district].filter(Boolean).join(" · ");
    document.getElementById("locationValue").textContent = locationText || "Локация не указана";

    // Render seller
    document.getElementById("sellerName").textContent = post.contact_name || post.user?.name || "Продавец";

    // Render phone
    document.getElementById("contactPhone").textContent = post.phone || post.user?.phone || "Не указан";

    // Render telegram if available
    if (post.telegram) {
        document.getElementById("telegramItem").style.display = "flex";
        document.getElementById("contactTelegram").textContent = "@" + post.telegram.replace("@", "");
    }

    // Render description
    const rawDescription = post.description || "";
    const cleanDesc = rawDescription.split('---')[0].trim();
    document.getElementById("descriptionText").textContent = cleanDesc || "Описание отсутствует";

    // Render attributes
    renderAttributes(post);

    // Check promote status
    if (post.promote_type && post.promote_ends_at) {
        const now = new Date();
        const endsAt = new Date(post.promote_ends_at);
        if (endsAt > now) {
            showPromoteStatus(post.promote_type, post.promote_ends_at);
        }
    }
}

// Render photos slider
function renderPhotos(images) {
    const container = document.getElementById("slidesContainer");
    const dotsContainer = document.getElementById("sliderDots");
    const counter = document.getElementById("sliderCounter");

    if (images.length === 0) {
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

    container.innerHTML = images.map((img, i) => {
        return `
            <div class="slide">
                <img src="${img}" alt="Фото ${i + 1}" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'display: flex; flex-direction: column; align-items: center; gap: 16px; color: var(--text-muted);\\'><span class=\\'material-icons-outlined\\' style=\\'font-size: 64px; opacity: 0.3;\\'>image_not_supported</span><span>Ошибка загрузки</span></div>'">
                <div class="slide-overlay"></div>
            </div>
        `;
    }).join("");

    dotsContainer.innerHTML = images.map((_, i) => `
        <div class="dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})"></div>
    `).join("");

    counter.textContent = `1/${images.length}`;

    // Swipe support
    let startX = 0;
    container.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
    }, {passive: true});

    container.addEventListener("touchend", (e) => {
        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;

        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentSlide < images.length - 1) {
                currentSlide++;
            } else if (diff < 0 && currentSlide > 0) {
                currentSlide--;
            }
            updateSlider();
        }
    }, {passive: true});
}

// Update slider position
function updateSlider() {
    const container = document.getElementById("slidesContainer");
    const dots = document.querySelectorAll(".dot");
    const counter = document.getElementById("sliderCounter");
    const totalSlides = document.querySelectorAll(".slide").length;

    if (totalSlides === 0) return;

    container.style.transform = `translateX(-${currentSlide * 100}%)`;

    dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === currentSlide);
    });

    counter.textContent = `${currentSlide + 1}/${totalSlides}`;
}

// Go to specific slide
function goToSlide(index) {
    currentSlide = index;
    updateSlider();
}

// Render price and category
function renderPriceCategory(post) {
    const priceValue = document.getElementById("priceValue");
    const priceCurrency = document.getElementById("priceCurrency");
    const categoryText = document.getElementById("categoryText");

    // Category
    const catName = categoryNames[post.subcategory] ||
                    categoryNames[post.category] ||
                    post.category ||
                    "Категория";
    categoryText.textContent = catName;

    // Price
    if (post.negotiable) {
        priceValue.textContent = "Договорная";
        priceCurrency.style.display = "none";
    } else if (post.price) {
        priceValue.textContent = parseInt(post.price).toLocaleString();
        priceCurrency.textContent = post.currency || "TJS";
        priceCurrency.style.display = "inline";
    } else {
        priceValue.textContent = "Цена не указана";
        priceCurrency.style.display = "none";
    }
}

// Render attributes
function renderAttributes(post) {
    const container = document.getElementById("attributesGrid");
    const section = document.getElementById("attributesSection");

    // Get attributes from post.attributes or parse from description
    let attrs = post.attributes || {};
 
    // If no attributes, try to parse from description
    if (Object.keys(attrs).length === 0 && post.description) {
        attrs = parseAttributesFromDescription(post.description);
    }

    const entries = Object.entries(attrs).filter(([_, v]) => v && v.toString().trim() !== "");

    if (entries.length === 0) {
        section.style.display = "none";
        return;
    }

    section.style.display = "block";

    container.innerHTML = entries.map(([key, value]) => `
        <div class="attribute-item">
            <div class="attribute-label">${attributeLabels[key] || key}</div>
            <div class="attribute-value">${value}</div>
        </div>
    `).join("");
}

// Parse attributes from description
function parseAttributesFromDescription(description) {
    const attrs = {};
    if (!description) return attrs;

    // Look for "---" section
    const parts = description.split("---");
    if (parts.length < 2) return attrs;

    const attrsText = parts[1];
    const lines = attrsText.trim().split("\n");

    lines.forEach(line => {
        if (line.includes(":")) {
            const [key, ...valueParts] = line.split(":");
            const value = valueParts.join(":").trim();
            if (key && value) {
                const cleanKey = key.trim().toLowerCase()
                    .replace(/\s+/g, "_")
                    .replace(/[()]/g, "");
                attrs[cleanKey] = value;
            }
        }
    });

    return attrs;
}

// Show promote status badge
function showPromoteStatus(type, endsAt) {
    const oldBadge = document.querySelector('.promote-status-badge');
    if (oldBadge) oldBadge.remove();

    const statusEl = document.createElement("div");
    statusEl.className = `promote-status-badge ${type === 'urgent' ? 'urgent' : ''}`;
    statusEl.innerHTML = `
        <span class="promote-icon">${type === 'vip' ? '⭐' : type === 'urgent' ? '🔥' : '📌'}</span>
        <span class="promote-text">${type.toUpperCase()} активно</span>
        <span class="promote-timer" id="promoteTimer"></span>
    `;

    const slider = document.querySelector(".image-slider");
    if (slider) {
        slider.appendChild(statusEl);
    }

    startTimer(endsAt);
}

// Start countdown timer
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

    updateTimer();
    setInterval(updateTimer, 60000);
}

// Promote modal functions
function openPromoteModal() {
    document.getElementById("promoteModal").classList.add("active");
}

function closePromote() {
    document.getElementById("promoteModal").classList.remove("active");
}

async function selectPromote(type) {
    closePromote();
    await activatePromotion(type);
}

async function activatePromotion(type) {
    showLoading(true);

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

        showPromoteStatus(type, data.ends_at);
        alert(`✅ ${type.toUpperCase()} активирован! Время: ${type === 'top' ? '2' : '6'} часов`);

    } catch (err) {
        console.error(err);
        alert("Ошибка активации продвижения");
    } finally {
        showLoading(false);
    }
}

// Archive ad
async function archiveAd() {
    if (!confirm("Переместить объявление в архив?")) return;

    showLoading(true);

    try {
        const res = await fetch(`/auth/archive-post?id=${postId}`, {
            method: "POST",
            credentials: "include"
        });

        if (!res.ok) throw new Error("Archive failed");

        alert("✅ Объявление перемещено в архив");
        window.location.href = "/auth/my-ads/archived";

    } catch (err) {
        console.error(err);
        alert("Ошибка при архивировании");
        showLoading(false);
    }
}

// Edit ad
function editAd() {
    // Redirect to edit page (add2.html with post_id)
    window.location.href = `/auth/add2?post_id=${postId}`;
}

// Go back
function goBack() {
    window.location.href = "/auth/my-ads/active";
}

// Show/hide loading
function showLoading(show) {
    document.getElementById("loadingOverlay").classList.toggle("active", show);
}

// Close modal on overlay click
document.getElementById("promoteModal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("promoteModal")) {
        closePromote();
    }
});
