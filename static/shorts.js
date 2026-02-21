document.addEventListener("DOMContentLoaded", loadShorts);

async function loadShorts() {
  const container = document.getElementById("shortsContainer");

  if (!container) {
    console.error("ERROR: Container not found!");
    return;
  }

  try {
    const res = await fetch("/shorts/shorts-data", {
      method: "GET",
      credentials: "include",
      headers: { "Accept": "application/json" }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const shorts = data.shorts || [];

    if (shorts.length === 0) {
      container.innerHTML = `
        <div class="short-item">
          <div class="empty-state">
            <p>Ҳоло видео нест</p>
            <button onclick="goToAdd()">Создать short</button>
          </div>
        </div>
      `;
      return;
    }

    let html = '';
    for (let i = 0; i < shorts.length; i++) {
      const short = shorts[i];
      const videoUrl = short.video_url || `/static/uploads/shorts/${short.video}`;

      html += `
        <div class="short-item" data-index="${i}" data-id="${short.id}">
          <video 
            id="video-${short.id}"
            src="${videoUrl}"
            loop
            playsinline
            preload="metadata"
            muted
          ></video>

          <!-- ⭐ ТУГМАИ ЗВУК -->
          <button class="mute-btn" id="mute-btn-${short.id}" onclick="toggleMute(${short.id})">
            🔇
          </button>

          <div class="short-info">
            <h3>${escapeHtml(short.title) || 'Без названия'}</h3>
            <p>@${escapeHtml(short.username) || 'unknown'}</p>
            <p>${escapeHtml(short.description) || ''}</p>
          </div>

          <div class="short-actions">
            <button onclick="likeShort(${short.id})">❤️</button>
            <button onclick="shareShort(${short.id})">↗️</button>
          </div>
        </div>
      `;
    }

    container.innerHTML = html;

    // Auto-play
    setupScrollObserver();

  } catch (err) {
    console.error("ERROR loading shorts:", err);
    container.innerHTML = `<div class="error">Ошибка загрузки: ${err.message}</div>`;
  }
}

// ⭐ ФАЪОЛ/ХОМУШ КАРДАНИ ЗВУК
function toggleMute(id) {
  const video = document.getElementById(`video-${id}`);
  const btn = document.getElementById(`mute-btn-${id}`);

  if (video.muted) {
    video.muted = false;
    btn.textContent = '🔊';
    console.log("Sound ON for video:", id);
  } else {
    video.muted = true;
    btn.textContent = '🔇';
    console.log("Sound OFF for video:", id);
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function setupScrollObserver() {
  const videos = document.querySelectorAll('.short-item video');

  if (videos.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(e => console.log("Autoplay prevented:", e));
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, { threshold: 0.6 });

  videos.forEach(video => observer.observe(video));
}

function likeShort(id) {
  console.log("Like:", id);
}

function shareShort(id) {
  console.log("Share:", id);
}

function goToAdd() {
  window.location.href = "/auth/add-selection?post_id=0";
}

