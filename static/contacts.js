document.addEventListener("DOMContentLoaded", () => {
  const chatList = document.getElementById("contactsList");
  const searchInput = document.getElementById("searchInput");
  let users = [];

  // --------- Load all contacts ----------
  async function loadChats() {
    try {
      const res = await fetch(`/chat/contacts?user_id=${userId}`);
      users = await res.json();
      render(users);
    } catch(e) {
      console.error("Failed to load contacts:", e);
    }
  }

  // --------- Render contacts ----------
  function render(list) {
    chatList.innerHTML = "";
    list.forEach(u => {
      const avatar = u.avatar ? "/" + u.avatar + "?v=" + Date.now() : "/static/default-avatar.png";
      const div = document.createElement("div");
      div.className = "chat";
      div.innerHTML = `
        <img src="${avatar}">
        <div class="chat-body">
          <div class="chat-name">
            ${u.username}
            <span class="online-dot"></span>
          </div>
          <div class="chat-msg">${u.lastMessage || "Tap to start chatting"}</div>
        </div>
        <div class="chat-meta">9:07</div>
      `;
      div.onclick = () => {
        window.location.href = `/chat?user=${userId}&peer=${u.id}`;
      };
      chatList.appendChild(div);
    });
  }

  // --------- Search filter ----------
  searchInput?.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase();
    render(users.filter(u => u.username.toLowerCase().includes(q)));
  });

  // --------- Menu ----------
  const menuBtn = document.getElementById("menuBtn");
  const dropdownMenu = document.getElementById("dropdownMenu");
  const settingsItem = document.getElementById("settingsItem");

  menuBtn?.addEventListener("click", e => {
    e.stopPropagation();
    dropdownMenu?.classList.toggle("active");
  });

  settingsItem?.addEventListener("click", e => {
    e.stopPropagation();
    const link = settingsItem.dataset.link;
    if (link) window.location.href = link;
  });

  document.addEventListener("click", () => {
    dropdownMenu?.classList.remove("active");
  });

  if (window.location.pathname === "/auth/settings") {
    settingsItem?.classList.add("active");
  }

  loadChats();

  // --------- WebSocket for real-time ----------
  const ws = new WebSocket(`ws://${window.location.host}/chat/ws/${userId}`);
  ws.onmessage = event => {
    const data = JSON.parse(event.data);
    if (data.receiver_id === userId || data.sender_id === userId) {
      const index = users.findIndex(u => u.id === data.sender_id || u.id === data.receiver_id);
      if (index !== -1) {
        users[index].lastMessage = data.content;
      }
      render(users);
    }
  };
});
