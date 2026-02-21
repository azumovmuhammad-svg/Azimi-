document.addEventListener("DOMContentLoaded", () => {

  const postBtn = document.getElementById("postBtn");
  const shortBtn = document.getElementById("shortBtn");
  const continueBtn = document.getElementById("continueBtn");

  const params = new URLSearchParams(window.location.search);
  const postId = params.get("post_id");

  if (!postId) {
    alert("post_id не найден");
    return;
  }

  let selectedType = null;

  postBtn.addEventListener("click", () => {
    selectedType = "post";
    postBtn.style.backgroundColor = "#6fa8ff";
    shortBtn.style.backgroundColor = "#1b2433";
  });

  // ===== VIDEO CHOOSER =====
  const videoChooser = document.createElement("input");
  videoChooser.type = "file";
  videoChooser.accept = "video/*";
  videoChooser.hidden = true;
  document.body.appendChild(videoChooser);

  shortBtn.addEventListener("click", () => {
    selectedType = "short";
    shortBtn.style.backgroundColor = "#6fa8ff";
    postBtn.style.backgroundColor = "#1b2433";

    videoChooser.value = "";
    videoChooser.click();
  });

  videoChooser.addEventListener("change", async () => {
    const file = videoChooser.files[0];
    if (!file) return;

    // Намоиши loading ё интизорӣ
    shortBtn.style.opacity = "0.5";
    shortBtn.style.pointerEvents = "none";

    try {
      // 1. Сохтани draft
      const draftRes = await fetch("/shorts/create-draft", {
        method: "POST",
        credentials: "include"
      });
      const draftData = await draftRes.json();

      if (!draftData.draft_id) {
        alert("Ошибка создания draft");
        shortBtn.style.opacity = "1";
        shortBtn.style.pointerEvents = "auto";
        return;
      }

      // 2. Upload-и видео
      const fd = new FormData();
      fd.append("draft_id", draftData.draft_id);
      fd.append("file", file);

      const uploadRes = await fetch("/shorts/upload-video", {
        method: "POST",
        body: fd,
        credentials: "include"
      });

      const uploadData = await uploadRes.json();

      if (uploadData.status === "ok") {
        // Муваффақият - равак ба саҳифаи add-short
        window.location.href = `/auth/add-short?short_id=${draftData.draft_id}`;
      } else {
        alert("Ошибка загрузки видео: " + (uploadData.message || "Неизвестная ошибка"));
        shortBtn.style.opacity = "1";
        shortBtn.style.pointerEvents = "auto";
      }

    } catch (err) {
      console.error("Error:", err);
      alert("Произошла ошибка при загрузке");
      shortBtn.style.opacity = "1";
      shortBtn.style.pointerEvents = "auto";
    }
  });

  continueBtn.addEventListener("click", () => {
    if (!selectedType) {
      alert("Пожалуйста, выберите Post или Short");
      return;
    }
    if (selectedType === "post") {
      window.location.href = `/auth/add?post_id=${postId}`;
    }
  });

  document.querySelector(".back-icon").addEventListener("click", () => {
    history.back();
  });

});

