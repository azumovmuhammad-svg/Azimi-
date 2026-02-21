document.addEventListener("DOMContentLoaded", () => {
  const nextBtn = document.getElementById("nextBtn");
  const phoneInput = document.getElementById("phoneInput");
  const countryField = document.getElementById("countryField");
  const countryNameEl = document.getElementById("countryName");
  const countryCodeEl = document.getElementById("countryCode");

  // ===== COUNTRY CLICK =====
  countryField.addEventListener("click", () => {
    window.location.href = "/auth/change-phone/country";
  });

  // ===== LOAD COUNTRY FROM STORAGE =====
  const name = localStorage.getItem("countryName");
  const code = localStorage.getItem("countryCode");

  if (name && code) {
    countryNameEl.textContent = name;
    countryCodeEl.textContent = code;
  }

  // ===== NEXT CLICK =====
  nextBtn.addEventListener("click", async () => {
    const phone = phoneInput.value.trim();

    if (!phone) {
      alert("Enter phone number");
      return;
    }

    try {
      const res = await fetch("/phone/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: (code || "") + phone
        })
      });

      if (res.ok) {
        window.location.href = "/profile";
      } else {
        alert("Failed to update phone");
      }
    } catch (e) {
      console.error(e);
      alert("Server error");
    }
  });
});
