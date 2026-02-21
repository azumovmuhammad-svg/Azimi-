document.addEventListener("DOMContentLoaded", () => {
    const userId = document.body.dataset.userId;
    if (!userId) return;

    const fontRange = document.getElementById("fontRange");
    const fontValue = document.getElementById("fontValue");

    let settings = {};

    // LOAD SETTINGS
    fetch(`/auth/chat-settings?user_id=${userId}`)
        .then(r => r.json())
        .then(data => {
            settings = data;

            fontRange.value = data.font_size;
            fontValue.textContent = data.font_size;

            document.body.dataset.theme = data.theme;
        });

     fetch("/auth/chat-settings", {
       method: "POST",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bubble_style: style, user_id: 1 })
      });

    // FONT SIZE
    fontRange.addEventListener("input", () => {
        fontValue.textContent = fontRange.value;
        settings.font_size = parseInt(fontRange.value);
        save();
    });

    // THEME CLICK
document.querySelectorAll(".theme").forEach(t => {
  t.addEventListener("click", () => {
    const theme = t.dataset.theme;

    document.body.setAttribute("data-theme", theme);

    document.querySelectorAll(".theme").forEach(x =>
      x.classList.remove("active")
    );
    t.classList.add("active");

    settings.theme = theme;
    saveSettings();
  });
});

    // SAVE FUNCTION
    function save() {
        fetch(`/auth/chat-settings?user_id=${userId}`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(settings)
        });
    }
});

const bubbleOptions = document.querySelectorAll(".bubble-option");

bubbleOptions.forEach(option => {
  option.addEventListener("click", () => {
    bubbleOptions.forEach(o => o.classList.remove("active"));
    option.classList.add("active");

    const style = option.dataset.style;
    saveBubbleStyle(style);
  });
});

function saveBubbleStyle(style) {
  fetch("/auth/chat-settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bubble_style: style })
  });
}

const themeOptions = document.querySelectorAll(".theme-option");
const userId = document.body.dataset.userId; // user_id динамикӣ

// Load current theme
fetch(`/auth/chat-settings?user_id=${userId}`)
  .then(res => res.json())
  .then(data => {
      document.body.dataset.theme = data.theme;
      document.querySelector(`.theme-option[data-theme="${data.theme}"]`)?.classList.add("active");
  });

// Select theme
themeOptions.forEach(option => {
  option.addEventListener("click", () => {
    themeOptions.forEach(o => o.classList.remove("active"));
    option.classList.add("active");

    const theme = option.dataset.theme;
    document.body.dataset.theme = theme;

    // Save to server
    fetch("/auth/chat-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: theme, user_id: userId })
    })
    .then(res => res.json())
    .then(data => console.log("Theme saved:", data))
    .catch(err => console.error(err));
  });
});
