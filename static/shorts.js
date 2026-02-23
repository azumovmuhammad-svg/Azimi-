document.addEventListener("DOMContentLoaded", loadShorts);

let expandedStates = {};
let progressIntervals = {};

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
            <span class="material-icons-outlined" style="font-size: 64px; opacity: 0.5;">videocam_off</span>
            <p>Ҳоло видео нест</p>
            <button onclick="startNewPost()">Создать short</button>
          </div>
        </div>
      `;
      return;
    }

    let html = '';
    for (let i = 0; i < shorts.length; i++) {
      const short = shorts[i];
      const videoUrl = short.video_url || `/static/uploads/shorts/${short.video}`;
      const avatarUrl = short.avatar || '/static/default-avatar.png';
      
      expandedStates[short.id] = expandedStates[short.id] || false;

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

          <!-- ТУГМАИ ЗВУК -->
          <button class="mute-btn" id="mute-btn-${short.id}" onclick="toggleMute(${short.id})">
            <span class="material-icons-outlined">volume_off</span>
          </button>

          <!-- SHORTS LABEL -->
          <div class="shorts-label">Shorts</div>

          <!-- PROGRESS BAR -->
          <div class="video-progress-container" id="progress-container-${short.id}" onclick="seekVideo(event, ${short.id})">
            <div class="video-progress-bar" id="progress-bar-${short.id}"></div>
          </div>
          
          <!-- ВАҚТИ ВИДЕО -->
          <div class="video-time" id="video-time-${short.id}">0:00 / 0:00</div>

          <!-- ТУГМАҲОИ АМУДӢ ДАР ТАРАФИ РОСТ -->
          <div class="short-actions-vertical">
            <button class="action-btn-vertical" id="like-btn-${short.id}" onclick="likeShort(${short.id})">
              <span class="material-icons-outlined">favorite_border</span>
            </button>
            <button class="action-btn-vertical" onclick="shareShort(${short.id})">
              <span class="material-icons-outlined">share</span>
            </button>
            <button class="action-btn-vertical" onclick="copyShort(${short.id})">
              <span class="material-icons-outlined">content_copy</span>
            </button>
          </div>

          <!-- ОВЕРЛЕЙ БА ТАРАФИ ЧАП -->
          <div class="short-overlay">
            <!-- HEADER бо аватар, ном ва НАПИСАТЬ -->
            <div class="short-header">
              <img src="${avatarUrl}" class="avatar" onerror="this.src='/static/default-avatar.png'">
              <span class="username">@${escapeHtml(short.username) || 'unknown'}</span>
              <button class="write-btn" onclick="openChat(${short.user_id})">
                Написать
              </button>
            </div>
            
            <!-- НАЗВАНИЕ -->
            <div class="short-title">${escapeHtml(short.title) || 'Без названия'}</div>
            
            <!-- ОПИСАНИЕ -->
            <div class="short-description" id="desc-${short.id}">
              <p class="description-text ${expandedStates[short.id] ? 'expanded' : ''}">
                ${escapeHtml(short.description) || ''}
              </p>
              ${short.description && short.description.length > 80 ? 
                `<button class="read-more-btn" onclick="toggleDescription(${short.id})">
                  ${expandedStates[short.id] ? 'Свернуть' : '...ещё'}
                </button>` : ''}
            </div>
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
    addVideoClickListeners();
    setupScrollObserver();
    setupVideoEvents();

  } catch (err) {
    console.error("ERROR loading shorts:", err);
    container.innerHTML = `<div class="error">Ошибка загрузки: ${err.message}</div>`;
  }
}

function addVideoClickListeners() {
  const videos = document.querySelectorAll('.short-item video');
  videos.forEach(video => {
    video.addEventListener('click', function(e) {
      e.stopPropagation();
      const shortId = this.id.replace('video-', '');
      togglePlay(shortId);
    });
  });
}

function setupVideoEvents() {
  const videos = document.querySelectorAll('.short-item video');
  videos.forEach(video => {
    const shortId = video.id.replace('video-', '');
    
    video.addEventListener('timeupdate', () => updateProgress(shortId));
    video.addEventListener('loadedmetadata', () => updateTimeDisplay(shortId));
    video.addEventListener('play', () => startProgressUpdate(shortId));
    video.addEventListener('pause', () => stopProgressUpdate(shortId));
    video.addEventListener('ended', () => {
      stopProgressUpdate(shortId);
      resetProgress(shortId);
    });
  });
}

function updateProgress(id) {
  const video = document.getElementById(`video-${id}`);
  const progressBar = document.getElementById(`progress-bar-${id}`);
  if (!video || !progressBar) return;
  
  const percent = (video.currentTime / video.duration) * 100;
  progressBar.style.width = percent + '%';
  updateTimeDisplay(id);
}

function startProgressUpdate(id) {
  stopProgressUpdate(id);
  progressIntervals[id] = setInterval(() => updateProgress(id), 100);
}

function stopProgressUpdate(id) {
  if (progressIntervals[id]) {
    clearInterval(progressIntervals[id]);
    delete progressIntervals[id];
  }
}

function resetProgress(id) {
  const progressBar = document.getElementById(`progress-bar-${id}`);
  if (progressBar) progressBar.style.width = '0%';
  updateTimeDisplay(id);
}

function updateTimeDisplay(id) {
  const video = document.getElementById(`video-${id}`);
  const timeDisplay = document.getElementById(`video-time-${id}`);
  if (!video || !timeDisplay) return;
  
  const current = formatTime(video.currentTime || 0);
  const duration = formatTime(video.duration || 0);
  timeDisplay.textContent = `${current} / ${duration}`;
}

function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function seekVideo(event, id) {
  const video = document.getElementById(`video-${id}`);
  const container = document.getElementById(`progress-container-${id}`);
  if (!video || !container) return;
  
  const rect = container.getBoundingClientRect();
  const pos = (event.clientX - rect.left) / rect.width;
  video.currentTime = pos * video.duration;
  updateProgress(id);
}

function togglePlay(id) {
  const video = document.getElementById(`video-${id}`);
  if (video.paused) {
    video.play().catch(() => {});
  } else {
    video.pause();
  }
}

function toggleMute(id) {
  const video = document.getElementById(`video-${id}`);
  const btn = document.getElementById(`mute-btn-${id}`);
  const icon = btn.querySelector('span');

  if (video.muted) {
    video.muted = false;
    icon.textContent = 'volume_up';
  } else {
    video.muted = true;
    icon.textContent = 'volume_off';
  }
}

function toggleDescription(id) {
  expandedStates[id] = !expandedStates[id];
  const descElement = document.getElementById(`desc-${id}`);
  const textElement = descElement.querySelector('.description-text');
  const btnElement = descElement.querySelector('.read-more-btn');
  
  if (expandedStates[id]) {
    textElement.classList.add('expanded');
    btnElement.textContent = 'Свернуть';
  } else {
    textElement.classList.remove('expanded');
    btnElement.textContent = '...ещё';
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function setupScrollObserver() {
  const videos = document.querySelectorAll('.short-item video');
  if (videos.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      const shortId = video.id.replace('video-', '');
      
      if (entry.isIntersecting) {
        video.play().catch(() => {});
        startProgressUpdate(shortId);
      } else {
        video.pause();
        video.currentTime = 0;
        stopProgressUpdate(shortId);
        resetProgress(shortId);
      }
    });
  }, { threshold: 0.7 });

  videos.forEach(video => observer.observe(video));
}

async function likeShort(id) {
  const btn = document.getElementById(`like-btn-${id}`);
  const icon = btn.querySelector('span');
  
  if (btn.classList.contains('liked')) {
    btn.classList.remove('liked');
    icon.textContent = 'favorite_border';
  } else {
    btn.classList.add('liked');
    icon.textContent = 'favorite';
    btn.style.transform = 'scale(1.2)';
    setTimeout(() => {
      btn.style.transform = 'scale(1)';
    }, 200);
  }
}

async function shareShort(id) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Short Video',
        text: 'Check out this video!',
        url: window.location.href
      });
    } catch (err) {
      console.log('Share cancelled');
    }
  } else {
    copyShort(id);
    showToast('Ссылка скопирована!');
  }
}

function copyShort(id) {
  const url = `${window.location.origin}/shorts/${id}`;
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      showToast('Ссылка скопирована!');
    }).catch(() => {
      fallbackCopy(url);
    });
  } else {
    fallbackCopy(url);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    document.execCommand('copy');
    showToast('Ссылка скопирована!');
  } catch (err) {
    console.error('Copy failed:', err);
  }
  
  document.body.removeChild(textarea);
}

function showToast(message) {
  const existing = document.querySelector('.toast-message');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.8);
    color: #fff;
    padding: 12px 24px;
    border-radius: 24px;
    font-size: 14px;
    z-index: 1000;
    animation: fadeInUp 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

function startNewPost() {
  window.location.href = "/auth/add-selection?post_id=0";
}

function openChat(userId) {
  if (!userId) return;
  window.location.href = `/chat?user=${userId}&peer=${userId}`;
}

// CSS Animation for toast
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
`;
document.head.appendChild(style);

