document.addEventListener("DOMContentLoaded", async () => {

  const video = document.getElementById("videoPreview");
  const publishBtn = document.getElementById("publishBtn");

  const title = document.getElementById("title");
  const description = document.getElementById("description");
  const price = document.getElementById("price");

  const fields = [title, description, price];

  // Гирифтани short_id
  const contentDiv = document.querySelector(".content");
  let draftId = contentDiv ? contentDiv.dataset.shortId : null;
  
  if (!draftId) {
    const params = new URLSearchParams(window.location.search);
    draftId = params.get("short_id");
  }

  if (!draftId) {
    alert("short_id не найден");
    return;
  }

  // Логикаи publish
  publishBtn.addEventListener("click", async () => {

    let hasError = false;
    fields.forEach(f => {
      f.parentElement.classList.remove("error");
      if (!f.value.trim()) {
        f.parentElement.classList.add("error");
        hasError = true;
      }
    });

    if (hasError) {
      if (navigator.vibrate) navigator.vibrate(200);
      return;
    }

    try {
      // 1. Save details
      const fd = new FormData();
      fd.append("draft_id", draftId);
      fd.append("title", title.value);
      fd.append("description", description.value);

      const detailsRes = await fetch("/shorts/add-details", {
        method: "POST",
        body: fd,
        credentials: "include"
      });

      if (!detailsRes.ok) throw new Error("Failed to save details");

      // 2. Publish
      const publishRes = await fetch("/shorts/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ draft_id: draftId })
      });

      if (!publishRes.ok) throw new Error("Failed to publish");

      // ⭐ ЯКРАНГ: Ба FEED равак, на ба shorts!
      alert("Short успешно опубликован!");
      window.location.href = "/feed";

    } catch (err) {
      console.error("Error:", err);
      alert("Ошибка публикации: " + err.message);
    }
  });

  // Load video...
  try {
    const res = await fetch(`/shorts/get-short?id=${draftId}`, {
      credentials: "include"
    });
    const data = await res.json();
    if (data.video) {
      video.src = data.video;
      video.load();
    }
  } catch (err) {
    console.error("Error loading video:", err);
  }
});

