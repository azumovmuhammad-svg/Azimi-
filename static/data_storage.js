const userId = localStorage.getItem("user_id");

if (!userId) {
  location.href = "/login";
}

// LOAD SAVED SETTINGS
fetch(`/settings/data-storage?user_id=${userId}`)
  .then(r => r.json())
  .then(data => {
    document.getElementById("iconToggle").checked = data.app_icon;
  });

// SAVE TO DATABASE
document.getElementById("iconToggle").addEventListener("change", e => {
  fetch("/settings/data-storage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      app_icon: e.target.checked
    })
  });
});

function openStorage() {
  alert("Storage details (future)");
}
