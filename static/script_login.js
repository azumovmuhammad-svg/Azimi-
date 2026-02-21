console.log("LOGIN JS LOADED");

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("send-code");
  const phoneInput = document.getElementById("phone");

  // Format phone number as user types
  phoneInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");

    // Add +992 if not present
    if (value.startsWith("992")) {
      value = "+" + value;
    } else if (!value.startsWith("+992")) {
      value = "+992" + value;
    }

    // Limit length
    if (value.length > 13) value = value.slice(0, 13);

    // Format: +992 92 XXX XXXX
    let formatted = value;
    if (value.length > 4) {
      formatted = value.slice(0, 4) + " " + value.slice(4);
    }
    if (value.length > 6) {
      formatted = formatted.slice(0, 7) + " " + formatted.slice(7);
    }
    if (value.length > 9) {
      formatted = formatted.slice(0, 11) + " " + formatted.slice(11);
    }

    e.target.value = formatted;

    // Enable/disable button
    btn.disabled = value.replace(/\D/g, "").length < 12;
  });

  btn.addEventListener("click", async () => {
    const value = phoneInput.value.trim();
    const cleanPhone = value.replace(/\s/g, "");

    if (!value || cleanPhone.length < 12) {
      alert("Введите корректный номер телефона");
      return;
    }

    // Show loading state
    btn.disabled = true;
    btn.innerHTML = '<span class="material-icons-outlined">hourglass_top</span> Отправка...';

    try {
      const res = await fetch("/auth/send_code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ phone: cleanPhone })
      });

      if (!res.ok) {
        throw new Error("Send code failed");
      }

      // Store phone and redirect
      localStorage.setItem("login_phone", cleanPhone);

      // Show success animation
      btn.innerHTML = '<span class="material-icons-outlined">check</span> Отправлено!';
      btn.style.background = "linear-gradient(135deg, #2ecc71, #27ae60)";

      setTimeout(() => {
        window.location.href = "/register";
      }, 500);

    } catch (err) {
      console.error(err);
      btn.disabled = false;
      btn.innerHTML = '<span class="material-icons-outlined">send</span> Отправить код';
      alert("Ошибка отправки кода. Попробуйте снова.");
    }
  });
});

