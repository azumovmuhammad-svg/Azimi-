document.addEventListener("DOMContentLoaded", async () => {
  try {
    const user = await loadUserProfile();
    renderProfile(user);
    await loadUserStats();
    initNavigation();
    initMenu();
    initLogout();
  } catch (err) {
    if (err.message === "Unauthorized") {
      window.location.href = "/login";
    }
  }
});

async function loadUserProfile() {
  const res = await fetch("/auth/profile", { credentials: "include" });
  if (res.status === 401) throw new Error("Unauthorized");
  if (!res.ok) throw new Error("Failed to load profile");
  return await res.json();
}

function renderProfile(user) {
  document.getElementById("username").textContent = user.username || "Пользователь";
  document.getElementById("phone").textContent = user.phone || "";
  if (user.avatar && user.avatar !== "null") {
    document.getElementById("avatar").src = "/" + user.avatar;
  }
}

async function loadUserStats() {
  try {
    const res = await fetch("/auth/my-posts-count", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      document.getElementById("activeCount").textContent = data.active || 0;
      document.getElementById("archivedCount").textContent = data.archived || 0;
    }
  } catch (err) {
    console.log("Stats not loaded");
  }
}

function initNavigation() {
  document.querySelector(".back-btn").addEventListener("click", () => history.back());
  document.getElementById("profileBtn").addEventListener("click", () => {
    window.location.href = "/profile";
  });
}

function initMenu() {
  document.querySelectorAll(".item").forEach(item => {
    item.addEventListener("click", () => {
      const link = item.dataset.link;
      if (link) window.location.href = link;
    });
  });
}

function initLogout() {
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    if (!confirm("Выйти из аккаунта?")) return;
    try {
      const res = await fetch("/logout", { credentials: "include" });
      if (res.ok) window.location.href = "/login";
    } catch (err) {
      alert("Ошибка выхода");
    }
  });
}

