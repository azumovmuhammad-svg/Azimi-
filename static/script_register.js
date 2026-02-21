document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("code-form");
  const inputs = document.querySelectorAll(".code-input");
  const submitBtn = document.getElementById("submitBtn");
  const phoneDisplay = document.getElementById("phone-display");
  const countdownEl = document.getElementById("countdown");
  const resendBtn = document.getElementById("resendBtn");

  // Get phone from localStorage
  const phone = localStorage.getItem("login_phone");

  if (!phone) {
    alert("Сессия истекла. Вернитесь на страницу входа.");
    window.location.href = "/login";
    return;
  }

  // Display formatted phone
  phoneDisplay.textContent = phone.replace(/(\+\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/, "$1 $2 XXX XX XX");

  // Auto-focus and input handling
  inputs.forEach((input, index) => {
    // Auto-focus first input
    if (index === 0) input.focus();

    input.addEventListener("input", (e) => {
      const value = e.target.value.replace(/\D/g, "");
      e.target.value = value;

      if (value) {
        input.classList.add("filled");
        // Move to next
        if (index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
      } else {
        input.classList.remove("filled");
      }

      // Check if all filled
      const code = Array.from(inputs).map(i => i.value).join("");
      submitBtn.disabled = code.length !== 6;
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && index > 0) {
        inputs[index - 1].focus();
      }
    });

    // Paste support
    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);

      paste.split("").forEach((char, i) => {
        if (inputs[i]) {
          inputs[i].value = char;
          inputs[i].classList.add("filled");
        }
      });

      if (paste.length === 6) {
        submitBtn.disabled = false;
        submitBtn.focus();
      } else if (inputs[paste.length]) {
        inputs[paste.length].focus();
      }
    });
  });

  // Countdown timer
  let timeLeft = 59;
  let timerInterval;

  function startTimer() {
    timeLeft = 59;
    countdownEl.style.display = "block";
    resendBtn.classList.remove("active");

    timerInterval = setInterval(() => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      countdownEl.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        countdownEl.style.display = "none";
        resendBtn.classList.add("active");
      }
      timeLeft--;
    }, 1000);
  }

  startTimer();

  // Resend code
  resendBtn.addEventListener("click", async () => {
    resendBtn.disabled = true;

    try {
      const res = await fetch("/auth/send_code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });

      if (res.ok) {
        startTimer();
        // Clear inputs
        inputs.forEach(i => {
          i.value = "";
          i.classList.remove("filled");
        });
        inputs[0].focus();
        submitBtn.disabled = true;
      }
    } catch (err) {
      alert("Ошибка отправки кода");
    }

    resendBtn.disabled = false;
  });

  // Submit form
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const code = Array.from(inputs).map(i => i.value).join("");

    if (code.length !== 6) {
      alert("Введите 6-значный код");
      return;
    }

    // Show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="material-icons-outlined">hourglass_top</span> Проверка...';

    const formData = new FormData();
    formData.append("phone", phone);
    formData.append("code", code);

    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Неверный код");
      }

      // Success
      submitBtn.innerHTML = '<span class="material-icons-outlined">check_circle</span> Успешно!';
      submitBtn.style.background = "linear-gradient(135deg, #2ecc71, #27ae60)";

      localStorage.removeItem("login_phone");
      localStorage.setItem("user_id", data.user_id);

      setTimeout(() => {
        if (data.needs_setup) {
          window.location.href = "/setup-profile";
        } else {
          window.location.href = "/feed";
        }
      }, 500);

    } catch (err) {
      console.error(err);

      // Shake animation
      form.style.animation = "shake 0.5s";
      setTimeout(() => form.style.animation = "", 500);

      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span class="material-icons-outlined">check_circle</span> Подтвердить';

      // Clear inputs
      inputs.forEach(i => {
        i.value = "";
        i.classList.remove("filled");
      });
      inputs[0].focus();

      alert(err.message || "Неверный код. Попробуйте снова.");
    }
  });
});

// Shake animation
const style = document.createElement("style");
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
`;
document.head.appendChild(style);

