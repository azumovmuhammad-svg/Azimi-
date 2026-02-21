document.addEventListener("DOMContentLoaded", async () => {
  await loadHistory();
});

async function loadHistory() {
  const container = document.getElementById("chatList");

  try {
    const res = await fetch("/chat/history", {
      credentials: "include"
    });

    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }

    if (!res.ok) throw new Error("Failed to load");

    const chats = await res.json();

    if (chats.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon material-icons-outlined">chat_bubble_outline</div>
          <p>Нет сообщений</p>
          <p>Начните общение с продавцом</p>
        </div>
      `;
      return;
    }

    // === Чатҳои нав (сортировка) дар боло ===
    // Аллакай ORDER BY m.created_at DESC дар SQL
    container.innerHTML = chats.map(chat => `
      <div class="chat-item" onclick="openChat(${chat.contact_id})">
        <img src="${chat.avatar}" class="avatar" onerror="this.src='/static/default-avatar.png'">
        <div class="chat-info">
          <div class="chat-header">
            <span class="name">${escapeHtml(chat.username)}</span>
            <span class="time">${chat.last_time}</span>
          </div>
          <div class="chat-preview">
            <span class="message ${chat.last_sender_id === chat.current_user_id ? 'you' : ''}">
              ${chat.last_sender_id === chat.current_user_id ? 'Вы: ' : ''}${escapeHtml(chat.last_message)}
            </span>
          </div>
        </div>
      </div>
    `).join("");

  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon material-icons-outlined">error_outline</div>
        <p>Ошибка загрузки</p>
      </div>
    `;
  }
}

function openChat(userId) {
  window.location.href = `/chat?user=${userId}&peer=${userId}`;
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ===== Функсияи startNewPost (аз feed.js) =====
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

// ===== Shorts button =====
document.getElementById("shorts-btn")?.addEventListener("click", () => {
  window.location.href = "/shorts";
});

