document.addEventListener("DOMContentLoaded", () => {
  const photoGrid = document.getElementById("photoGrid");
  const addPhotoBtn = document.getElementById("addPhotoBtn");
  const imageInput = document.getElementById("imageInput");
  const continueBtn = document.getElementById("continueBtn");

  let selectedFiles = [];
  const MAX_PHOTOS = 10;

  // Check for feed preview
  const feedFileURL = sessionStorage.getItem("ADD_FILE_URL");
  const feedFileType = sessionStorage.getItem("ADD_FILE_TYPE");
  if (feedFileURL && feedFileType === "post") {
    fetch(feedFileURL)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "feed_image.jpg", { type: "image/jpeg" });
        selectedFiles.push(file);
        renderPreview(file, true);
        updateUI();
      })
      .catch(err => console.log("Feed preview error:", err));
    sessionStorage.removeItem("ADD_FILE_URL");
    sessionStorage.removeItem("ADD_FILE_TYPE");
  }

  function renderPreview(file, isMain = false) {
    const div = document.createElement("div");
    div.className = `preview-item ${isMain ? 'main' : ''}`;
    div.dataset.filename = file.name;

    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.onload = () => URL.revokeObjectURL(img.src); // Озод кардани ҳофиза

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.innerHTML = '<span class="material-icons-outlined">close</span>';
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      selectedFiles = selectedFiles.filter(f => f !== file);
      div.remove();
      updateMainPhoto();
      updateUI();
    };

    div.appendChild(img);
    div.appendChild(removeBtn);
    photoGrid.insertBefore(div, addPhotoBtn);
  }

  function updateMainPhoto() {
    const items = photoGrid.querySelectorAll(".preview-item");
    items.forEach((item, index) => {
      item.classList.toggle("main", index === 0);
    });
  }

  function updateUI() {
    const hasPhotos = selectedFiles.length > 0;
    continueBtn.disabled = !hasPhotos;
    addPhotoBtn.style.display = selectedFiles.length >= MAX_PHOTOS ? "none" : "flex";

    // Update progress
    const step1 = document.querySelector(".progress-step:nth-child(1)");
    if (step1) step1.classList.add("active");
  }

  // File input handler
  imageInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files);

    files.forEach(file => {
      if (selectedFiles.length < MAX_PHOTOS) {
        selectedFiles.push(file);
        renderPreview(file, selectedFiles.length === 1);
      }
    });

    imageInput.value = "";
    updateUI();
  });

  // Add photo button
  addPhotoBtn.addEventListener("click", () => {
    imageInput.click();
  });

  // Continue button - ТАНҲО ЯКТА!
  continueBtn.addEventListener("click", async () => {
    if (selectedFiles.length === 0) {
      alert("Выберите хотя бы 1 фото");
      return;
    }

    // Save to PostData (агар вуҷуд дошта бошад)
    if (typeof PostData !== 'undefined') {
      PostData.photos = selectedFiles.map(f => f.name);
      PostData.save();
    }

    const formData = new FormData();
    selectedFiles.forEach(file => formData.append("files", file));

    // Гирифтани post_id
    const container = document.querySelector(".app") || document.querySelector(".container");
    let postId = container?.dataset.postId;

    // Агар нест, аз sessionStorage гиред ё "new" гузоред
    if (!postId) {
      postId = sessionStorage.getItem('current_post_id') || "new";
    }

    formData.append("post_id", postId);

    try {
      continueBtn.innerHTML = '<span class="material-icons-outlined">hourglass_top</span> Загрузка...';
      continueBtn.disabled = true;

      const res = await fetch("/auth/post/upload-images", {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Upload failed");
      }

      const data = await res.json();

      // Нигоҳ доштани post_id
      if (data.post_id) {
        sessionStorage.setItem('current_post_id', data.post_id);
      }

      // Гузариш ба add2
      window.location.href = `/auth/add2?post_id=${data.post_id}`;

    } catch (e) {
      console.error("Upload error:", e);
      alert("Ошибка загрузки: " + e.message);
      continueBtn.innerHTML = 'Продолжить <span class="material-icons-outlined">arrow_forward</span>';
      continueBtn.disabled = false;
    }
  });

  // Exit function
  window.exitPost = function() {
    if (confirm("Выйти без сохранения?")) {
      window.location.href = "/feed";
    }
  };

  // Initialize
  updateUI();
});

