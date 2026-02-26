const citiesData = {
  "Душанбе": {
    districts: ["Сино", "Фирдавсӣ", "И.Сомонӣ", "Шоҳмансур", "Ваҳдат", "Н.Махсум"],
    count: 1250
  },
  "Хуҷанд": {
    districts: ["4 мкр", "5 мкр", "8 мкр", "Панчшанбе", "Бобоҷон Ғафуров"],
    count: 890
  },
  "Бохтар": {
    districts: ["Марказ", "Борбад", "Дустӣ"],
    count: 650
  },
  "Кӯлоб": {
    districts: ["Марказ", "Сомониён", "Автостанция"],
    count: 420
  },
  "Рашт": {
    districts: ["Гарм", "Навобод", "Точикобод"],
    count: 180
  },
  "Истаравшан": {
    districts: ["Марказ", "9 мкр", "Гулакандоз"],
    count: 320
  },
  "Ваҳдат": {
    districts: ["Марказ", "Яван"],
    count: 150
  },
  "Турсунзода": {
    districts: ["Марказ", "Шаҳритус"],
    count: 200
  }
};

let selectedCity = null;
let selectedDistrict = null;
let postId = null;
let currentUser = null; // Маълумоти корбар

document.addEventListener("DOMContentLoaded", () => {
  postId = document.querySelector(".app").dataset.postId;

  // Боркунии маълумоти корбар
  loadUserData();

  // Phone input mask
  const phoneInput = document.getElementById("phoneInput");
  phoneInput.addEventListener("input", function(e) {
    let value = this.value.replace(/\D/g, "");
    if (value.length > 0) {
      if (value.length <= 2) {
        this.value = value;
      } else if (value.length <= 5) {
        this.value = value.slice(0, 2) + " " + value.slice(2);
      } else if (value.length <= 7) {
        this.value = value.slice(0, 2) + " " + value.slice(2, 5) + " " + value.slice(5);
      } else {
        this.value = value.slice(0, 2) + " " + value.slice(2, 5) + " " + value.slice(5, 7) + " " + value.slice(7, 9);
      }
    }
    validateForm();
  });

  // Name input
  document.getElementById("nameInput").addEventListener("input", validateForm);

  // Telegram toggle
  document.getElementById("showTelegramToggle").addEventListener("change", function() {
    const telegramInput = document.getElementById("telegramInput");
    telegramInput.disabled = !this.checked;
    if (!this.checked) telegramInput.value = "";
  });

  // Instagram toggle
  document.getElementById("showInstagramToggle").addEventListener("change", function() {
    const instagramInput = document.getElementById("instagramInput");
    instagramInput.disabled = !this.checked;
    if (!this.checked) instagramInput.value = "";
  });

  // Initially disable telegram and instagram
  document.getElementById("telegramInput").disabled = true;
  document.getElementById("instagramInput").disabled = true;

  // Continue button
  document.getElementById("continueBtn").addEventListener("click", submitForm);

  // City search
  document.getElementById("citySearch").addEventListener("input", filterCities);
});

// === ФУНКСИЯИ НАВ: Боркунии маълумоти корбар ===
async function loadUserData() {
  try {
    const res = await fetch("/auth/profile", {
      credentials: "include"
    });

    if (!res.ok) throw new Error("Failed to load user");

    currentUser = await res.json();

    // Пур кардани автоматии майдонҳо
    fillUserData();

  } catch (err) {
    console.error("Error loading user:", err);
    // Агар хатогӣ бошад, майдонҳо холӣ мемонанд
  }
}

// === ФУНКСИЯИ НАВ: Пур кардани майдонҳо бо маълумоти корбар ===
function fillUserData() {
  if (!currentUser) return;

  // Пур кардани ном
  const nameInput = document.getElementById("nameInput");
  if (nameInput && currentUser.username) {
    nameInput.value = currentUser.username;
  }

  // Пур кардани телефон (аз базаи +992XX XXX XX XX)
  const phoneInput = document.getElementById("phoneInput");
  if (phoneInput && currentUser.phone) {
    // Тоза кардани +992 аз аввал
    let phone = currentUser.phone.replace("+992", "").replace(/\D/g, "");
    // Форматирование: XX XXX XX XX
    if (phone.length >= 9) {
      phoneInput.value = phone.slice(0, 2) + " " + 
                         phone.slice(2, 5) + " " + 
                         phone.slice(5, 7) + " " + 
                         phone.slice(7, 9);
    } else {
      phoneInput.value = phone;
    }
  }

  // Проверка формы после заполнения
  validateForm();
}

function openCityModal() {
  const modal = document.getElementById("cityModal");
  renderCities();
  modal.classList.add("active");
}

function renderCities(filter = "") {
  const list = document.getElementById("cityList");
  const cities = Object.entries(citiesData).filter(([name]) =>
    name.toLowerCase().includes(filter.toLowerCase())
  );

  list.innerHTML = cities.map(([name, data]) => `
    <div class="city-item" onclick="selectCity('${name}')">
      <div>
        <div class="name">${name}</div>
        <div class="count">${data.count} объявлений</div>
      </div>
      <span class="material-icons-outlined">chevron_right</span>
    </div>
  `).join("");
}

function filterCities(e) {
  renderCities(e.target.value);
}

function selectCity(cityName) {
  selectedCity = cityName;
  selectedDistrict = null;

  document.getElementById("cityBtn").classList.add("selected");
  document.getElementById("cityBtn").querySelector(".selector-text").textContent = cityName;

  closeModals();

  // Show district selector
  document.getElementById("districtGroup").style.display = "block";
  document.getElementById("districtBtn").querySelector(".selector-text").textContent = "Выберите район";
  document.getElementById("mapPreview").style.display = "none";
  document.getElementById("districtBtn").classList.remove("selected");

  validateForm();
}

function openDistrictModal() {
  if (!selectedCity) return;

  const modal = document.getElementById("districtModal");
  const list = document.getElementById("districtList");

  document.getElementById("districtModalTitle").textContent = selectedCity;

  const districts = citiesData[selectedCity].districts;
  list.innerHTML = districts.map(district => `
    <div class="city-item" onclick="selectDistrict('${district}')">
      <div class="name">${district}</div>
      <span class="material-icons-outlined">chevron_right</span>
    </div>
  `).join("");

  modal.classList.add("active");
}

function selectDistrict(districtName) {
  selectedDistrict = districtName;

  document.getElementById("districtBtn").classList.add("selected");
  document.getElementById("districtBtn").querySelector(".selector-text").textContent = districtName;

  closeModals();

  // Show map preview
  document.getElementById("mapPreview").style.display = "flex";

  validateForm();
}

function resetLocation() {
  selectedCity = null;
  selectedDistrict = null;

  document.getElementById("cityBtn").classList.remove("selected");
  document.getElementById("cityBtn").querySelector(".selector-text").textContent = "Выберите город";

  document.getElementById("districtGroup").style.display = "none";
  document.getElementById("mapPreview").style.display = "none";

  validateForm();
}

function validateForm() {
  const phone = document.getElementById("phoneInput").value.replace(/\D/g, "");
  const name = document.getElementById("nameInput").value.trim();

  const isValid = selectedCity && phone.length >= 9 && name.length >= 2;
  document.getElementById("continueBtn").disabled = !isValid;
}

async function submitForm() {
  const btn = document.getElementById("continueBtn");
  btn.disabled = true;
  btn.innerHTML = '<span class="material-icons-outlined">hourglass_top</span> Сохранение...';

  const phoneValue = "+992" + document.getElementById("phoneInput").value.replace(/\D/g, "");
  const contactNameValue = document.getElementById("nameInput").value.trim();

  if (typeof PostData !== 'undefined') {
    PostData.city = selectedCity;
    PostData.district = selectedDistrict;
    PostData.phone = phoneValue;
    PostData.contactName = contactNameValue;
    PostData.telegram = document.getElementById("telegramInput").value.trim();
    PostData.showTelegram = document.getElementById("showTelegramToggle").checked;
    PostData.instagram = document.getElementById("instagramInput").value.trim();
    PostData.showInstagram = document.getElementById("showInstagramToggle").checked;
    PostData.allowMessages = document.getElementById("messagesToggle").checked;
    PostData.bargain = document.getElementById("bargainToggle").checked;
    PostData.save();
  }

  const payload = {
    post_id: postId,
    city: selectedCity,
    district: selectedDistrict,
    phone: phoneValue,
    contact_name: contactNameValue,
    telegram: document.getElementById("telegramInput").value.trim(),
    show_telegram: document.getElementById("showTelegramToggle").checked,
    instagram: document.getElementById("instagramInput").value.trim(),
    show_instagram: document.getElementById("showInstagramToggle").checked,
    allow_messages: document.getElementById("messagesToggle").checked,
    bargain: document.getElementById("bargainToggle").checked
  };

  try {
    const res = await fetch("/auth/post/add-location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Save failed");

    window.location.href = `/auth/add4?post_id=${postId}`;

  } catch (err) {
    console.error(err);
    alert("Ошибка сохранения");
    btn.disabled = false;
    btn.innerHTML = 'Далее <span class="material-icons-outlined">arrow_forward</span>';
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

