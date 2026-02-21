// Category data with subcategories and fields
const categoryData = {
  electronics: {
    name: "Электроника",
    icon: "📱",
    subcategories: {
      phones: {
        name: "Телефоны",
        fields: [
          { name: "brand", label: "Марка", type: "select", options: ["Apple", "Samsung", "Xiaomi", "Huawei", "Другой"] },
          { name: "model", label: "Модель", type: "text", placeholder: "Например: iPhone 13 Pro" },
          { name: "condition", label: "Состояние", type: "select", options: ["Новое", "Отличное", "Хорошее", "Удовлетворительное"] },
          { name: "memory", label: "Память", type: "select", options: ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"] },
          { name: "color", label: "Цвет", type: "text", placeholder: "Например: Синий" }
        ]
      },
      laptops: {
        name: "Ноутбуки",
        fields: [
          { name: "brand", label: "Марка", type: "select", options: ["Apple", "Dell", "HP", "Lenovo", "Asus", "Другой"] },
          { name: "screen_size", label: "Диагональ", type: "select", options: ["13\"", "14\"", "15.6\"", "16\"", "17\""] },
          { name: "ram", label: "ОЗУ", type: "select", options: ["4 GB", "8 GB", "16 GB", "32 GB", "64 GB"] },
          { name: "storage", label: "Накопитель", type: "select", options: ["SSD 128 GB", "SSD 256 GB", "SSD 512 GB", "SSD 1 TB", "HDD"] },
          { name: "condition", label: "Состояние", type: "select", options: ["Новое", "Отличное", "Хорошее", "Удовлетворительное"] }
        ]
      },
      audio: {
        name: "Аудио",
        fields: [
          { name: "type", label: "Тип", type: "select", options: ["Наушники", "Колонки", "Микрофон", "Усилитель"] },
          { name: "brand", label: "Марка", type: "text", placeholder: "Например: Sony" },
          { name: "connection", label: "Подключение", type: "select", options: ["Проводные", "Bluetooth", "Беспроводные"] },
          { name: "condition", label: "Состояние", type: "select", options: ["Новое", "Отличное", "Хорошее", "Удовлетворительное"] }
        ]
      }
    }
  },
  cars: {
    name: "Авто",
    icon: "🚗",
    subcategories: {
      cars: {
        name: "Легковые",
        fields: [
          { name: "brand", label: "Марка", type: "select", options: ["Toyota", "Honda", "BMW", "Mercedes", "Audi", "Lexus", "Hyundai", "Kia", "Другая"] },
          { name: "model", label: "Модель", type: "text", placeholder: "Например: Camry" },
          { name: "year", label: "Год выпуска", type: "select", options: Array.from({length: 30}, (_, i) => (2024 - i).toString()) },
          { name: "body_type", label: "Кузов", type: "select", options: ["Седан", "Хэтчбек", "Универсал", "Кроссовер", "Внедорожник", "Купе", "Минивэн"] },
          { name: "engine", label: "Двигатель", type: "select", options: ["Бензин", "Дизель", "Гибрид", "Электро"] },
          { name: "transmission", label: "Коробка", type: "select", options: ["Механика", "Автомат", "Вариатор", "Робот"] },
          { name: "drive", label: "Привод", type: "select", options: ["Передний", "Задний", "Полный"] },
          { name: "mileage", label: "Пробег (км)", type: "number", placeholder: "Например: 50000" },
          { name: "condition", label: "Состояние", type: "select", options: ["Отличное", "Хорошее", "Удовлетворительное", "Требует ремонта", "На запчасти"] }
        ]
      },
      trucks: {
        name: "Грузовые",
        fields: [
          { name: "brand", label: "Марка", type: "text", placeholder: "Например: KamAZ" },
          { name: "year", label: "Год", type: "select", options: Array.from({length: 30}, (_, i) => (2024 - i).toString()) },
          { name: "capacity", label: "Грузоподъемность", type: "text", placeholder: "Например: 10 тонн" },
          { name: "condition", label: "Состояние", type: "select", options: ["Отличное", "Хорошее", "Удовлетворительное"] }
        ]
      },
      parts: {
        name: "Запчасти",
        fields: [
          { name: "category", label: "Категория", type: "select", options: ["Двигатель", "Кузов", "Подвеска", "Электрика", "Салон", "Другое"] },
          { name: "brand", label: "Марка авто", type: "text", placeholder: "Например: Toyota" },
          { name: "model", label: "Модель", type: "text", placeholder: "Например: Camry 50" },
          { name: "condition", label: "Состояние", type: "select", options: ["Новое", "Б/у", "На разборку"] }
        ]
      }
    }
  },
  realestate: {
    name: "Недвижимость",
    icon: "🏠",
    subcategories: {
      apartments: {
        name: "Квартиры",
        fields: [
          { name: "rooms", label: "Комнат", type: "select", options: ["Студия", "1", "2", "3", "4", "5+"] },
          { name: "area", label: "Площадь (м²)", type: "number", placeholder: "Общая площадь" },
          { name: "floor", label: "Этаж", type: "text", placeholder: "Например: 5 из 9" },
          { name: "building_type", label: "Тип дома", type: "select", options: ["Панельный", "Кирпичный", "Монолитный", "Блочный"] },
          { name: "condition", label: "Состояние", type: "select", options: ["Евроремонт", "Хороший ремонт", "Среднее", "Требует ремонта", "Черновая отделка"] },
          { name: "heating", label: "Отопление", type: "select", options: ["Центральное", "Автономное", "Электро", "Отсутствует"] }
        ]
      },
      houses: {
        name: "Дома",
        fields: [
          { name: "rooms", label: "Комнат", type: "select", options: ["1", "2", "3", "4", "5", "6+"] },
          { name: "house_area", label: "Площадь дома (м²)", type: "number" },
          { name: "land_area", label: "Площадь участка (соток)", type: "number" },
          { name: "floors", label: "Этажность", type: "select", options: ["1", "2", "3", "4+"] },
          { name: "material", label: "Материал", type: "select", options: ["Кирпич", "Блок", "Дерево", "Саман", "Монолит"] },
          { name: "condition", label: "Состояние", type: "select", options: ["Отличное", "Хорошее", "Среднее", "Требует ремонта"] }
        ]
      },
      land: {
        name: "Участки",
        fields: [
          { name: "area", label: "Площадь (соток)", type: "number" },
          { name: "purpose", label: "Назначение", type: "select", options: ["ИЖС", "Садоводство", "Фермерство", "Коммерция", "Другое"] },
          { name: "communications", label: "Коммуникации", type: "select", options: ["Все есть", "Частично", "Нет"] }
        ]
      }
    }
  }
};

let selectedCategory = null;
let selectedSubcategory = null;
let postId = null;

document.addEventListener("DOMContentLoaded", () => {
  postId = document.querySelector(".app").dataset.postId;

  // Character counters
  document.getElementById("titleInput").addEventListener("input", function() {
    document.getElementById("titleCounter").textContent = this.value.length;
    validateForm();
  });

  document.getElementById("descriptionInput").addEventListener("input", function() {
    document.getElementById("descCounter").textContent = this.value.length;
    validateForm();
  });

  // Price negotiable toggle
  document.getElementById("negotiableCheckbox").addEventListener("change", function() {
    document.getElementById("priceInput").disabled = this.checked;
    if (this.checked) document.getElementById("priceInput").value = "";
  });

  // Continue button
  document.getElementById("continueBtn").addEventListener("click", submitForm);
});

function openCategoryModal() {
  const modal = document.getElementById("categoryModal");
  const list = document.getElementById("categoryList");

  list.innerHTML = Object.entries(categoryData).map(([key, cat]) => `
    <div class="category-item" onclick="selectCategory('${key}')">
      <div class="icon">${cat.icon}</div>
      <div class="info">
        <div class="name">${cat.name}</div>
        <div class="count">${Object.keys(cat.subcategories).length} подкатегорий</div>
      </div>
      <span class="material-icons-outlined">chevron_right</span>
    </div>
  `).join("");

  modal.classList.add("active");
}

function selectCategory(catKey) {
  selectedCategory = catKey;
  const cat = categoryData[catKey];

  document.getElementById("categoryBtn").classList.add("selected");
  document.getElementById("categoryBtn").querySelector(".selector-text").textContent = cat.name;

  closeModals();

  // Show subcategory section
  document.getElementById("subcategorySection").style.display = "block";
  document.getElementById("subcategoryBtn").querySelector(".selector-text").textContent = "Выберите подкатегорию";
  document.getElementById("dynamicFields").innerHTML = "";
  selectedSubcategory = null;
  document.getElementById("subcategoryBtn").classList.remove("selected");
}

function openSubcategoryModal() {
  if (!selectedCategory) return;

  const modal = document.getElementById("subcategoryModal");
  const list = document.getElementById("subcategoryList");
  const cat = categoryData[selectedCategory];

  document.getElementById("subcategoryTitle").textContent = cat.name;

  list.innerHTML = Object.entries(cat.subcategories).map(([key, sub]) => `
    <div class="category-item" onclick="selectSubcategory('${key}')">
      <div class="info" style="margin-left: 0;">
        <div class="name">${sub.name}</div>
        <div class="count">${sub.fields.length} параметров</div>
      </div>
      <span class="material-icons-outlined">chevron_right</span>
    </div>
  `).join("");

  modal.classList.add("active");
}

function selectSubcategory(subKey) {
  selectedSubcategory = subKey;
  const cat = categoryData[selectedCategory];
  const sub = cat.subcategories[subKey];

  document.getElementById("subcategoryBtn").classList.add("selected");
  document.getElementById("subcategoryBtn").querySelector(".selector-text").textContent = sub.name;

  closeModals();

  // Render dynamic fields
  renderDynamicFields(sub.fields);
}

function renderDynamicFields(fields) {
  const container = document.getElementById("dynamicFields");

  container.innerHTML = fields.map(field => {
    if (field.type === "select") {
      return `
        <div class="dynamic-field">
          <label class="field-label">${field.label}</label>
          <select class="select-input dynamic-data" name="${field.name}" required>
            <option value="">Выберите...</option>
            ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join("")}
          </select>
        </div>
      `;
    } else {
      return `
        <div class="dynamic-field">
          <label class="field-label">${field.label}</label>
          <input type="${field.type}" class="text-input dynamic-data" name="${field.name}" 
                 placeholder="${field.placeholder || ''}" required>
        </div>
      `;
    }
  }).join("");

  // Add validation listeners
  container.querySelectorAll("input, select").forEach(el => {
    el.addEventListener("change", validateForm);
    el.addEventListener("input", validateForm);
  });
  
  validateForm();
}

function validateForm() {
  const title = document.getElementById("titleInput").value.trim();
  const description = document.getElementById("descriptionInput").value.trim();
  const hasCategory = selectedCategory && selectedSubcategory;

  // Check dynamic fields
  const dynamicFields = document.querySelectorAll(".dynamic-data");
  let dynamicValid = true;
  dynamicFields.forEach(field => {
    if (field.required && !field.value) dynamicValid = false;
  });

  const isValid = title && description && hasCategory && dynamicValid;
  document.getElementById("continueBtn").disabled = !isValid;
}

// === ТАНҲО ЯК ФУНКСИЯИ submitForm() ===
async function submitForm() {
  const btn = document.getElementById("continueBtn");
  btn.disabled = true;
  btn.innerHTML = '<span class="material-icons-outlined">hourglass_top</span> Сохранение...';

  // Collect dynamic data
  const dynamicData = {};
  document.querySelectorAll(".dynamic-data").forEach(field => {
    dynamicData[field.name] = field.value;
  });

  // Save to PostData if available
  if (typeof PostData !== 'undefined') {
    PostData.title = document.getElementById("titleInput").value.trim();
    PostData.category = selectedCategory;
    PostData.subcategory = selectedSubcategory;
    PostData.price = document.getElementById("priceInput").value;
    PostData.currency = document.getElementById("currencySelect").value;
    PostData.negotiable = document.getElementById("negotiableCheckbox").checked;
    PostData.description = document.getElementById("descriptionInput").value.trim();
    PostData.attributes = dynamicData;
    PostData.save();
  }

  const formData = new FormData();
  formData.append("post_id", postId);
  formData.append("title", document.getElementById("titleInput").value.trim());
  formData.append("category", selectedCategory);
  formData.append("subcategory", selectedSubcategory);
  formData.append("price", document.getElementById("priceInput").value || "");
  formData.append("currency", document.getElementById("currencySelect").value);
  formData.append("negotiable", document.getElementById("negotiableCheckbox").checked ? "true" : "false");
  formData.append("description", document.getElementById("descriptionInput").value.trim());
  formData.append("attributes", JSON.stringify(dynamicData));

  try {
    const res = await fetch("/auth/post/add-details", {
      method: "POST",
      body: formData,
      credentials: "include"
    });

    if (!res.ok) throw new Error("Save failed");

    window.location.href = `/auth/add3?post_id=${postId}`;

  } catch (err) {
    console.error(err);
    alert("Ошибка сохранения");
    btn.disabled = false;
    btn.innerHTML = 'Продолжить <span class="material-icons-outlined">arrow_forward</span>';
  }
}

function closeModals() {
  document.querySelectorAll(".modal").forEach(m => m.classList.remove("active"));
}

function exitPost() {
  if (confirm("Выйти без сохранения?")) {
    window.location.href = "/feed";
  }
}

