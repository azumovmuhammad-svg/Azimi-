console.log("PROFILE JS LOADED");

document.addEventListener("DOMContentLoaded", async () => {

  /* ===== ELEMENTS ===== */
  const avatarEdit = document.getElementById("avatarEdit");
  const avatarImg = document.getElementById("avatar");
  const username = document.getElementById("username");
  const bio = document.getElementById("bio");
  const lastSeen = document.getElementById("lastSeen");

  const usernameRow = document.getElementById("usernameRow");
  const bioRow = document.getElementById("bioRow");
  const phoneRow = document.getElementById("phoneRow");
  const linksRow = document.getElementById("linksRow");

  let userId = null;
  let cropper = null;
  let originalSrc = avatarImg.src;

  /* ===== HELPER FUNCTION ===== */
  function getAvatarSrc(avatar) {
    return avatar ? avatar + "?v=" + Date.now() : "/static/default-avatar.png?v=" + Date.now();
  }

  /* ===== LOAD PROFILE ===== */
  try {
    const res = await fetch("/auth/profile");
    if (!res.ok) throw new Error("Failed to load profile");
    const data = await res.json();
    userId = data.id;

    // Навсозии header ва rows
    username.textContent = data.username || "";
    bio.textContent = data.bio || "";
    lastSeen.textContent = data.last_seen ? "Last seen " + data.last_seen : "Online";

    usernameRow.textContent = data.username || "";
    bioRow.textContent = data.bio || "";
    phoneRow.textContent = data.phone || "";
    if (linksRow) linksRow.textContent = data.links || "";

    avatarImg.src = getAvatarSrc(data.avatar);

  } catch (err) {
    console.error(err);
  }

  /* ===== CLICKABLE ROWS ===== */
  usernameRow?.addEventListener("click", () => window.location.href="/auth/edit-name");
  bioRow?.addEventListener("click", () => window.location.href="/auth/edit-about");
  phoneRow?.addEventListener("click", () => window.location.href="/auth/change-phone");
  linksRow?.addEventListener("click", () => window.location.href="/auth/edit-links");

  /* ===== AVATAR MODAL & CROP ===== */
  const avatarModal = document.createElement("div");
  avatarModal.style.cssText = `
    display:none;position:fixed;top:0;left:0;width:100%;height:100%;
    background:rgba(0,0,0,0.7);justify-content:center;align-items:center;
    z-index:1000;flex-direction:column;
  `;

  const avatarPreview = document.createElement("img");
  avatarPreview.style.cssText = "max-width:90%; max-height:70vh; border-radius:8px;";

  const avatarActions = document.createElement("div");
  avatarActions.style.cssText = "display:flex; gap:10px; margin-top:10px;";

  const editBtn = document.createElement("button"); editBtn.textContent = "Edit";
  const cancelBtn = document.createElement("button"); cancelBtn.textContent = "Cancel";
  const saveBtn = document.createElement("button"); saveBtn.textContent = "Save";

  avatarActions.append(editBtn, cancelBtn, saveBtn);
  avatarModal.append(avatarPreview, avatarActions);
  document.body.appendChild(avatarModal);

  const loading = document.createElement("div");
  loading.textContent = "Saving...";
  loading.style.cssText = `
    position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
    background:rgba(0,0,0,0.8);color:white;padding:10px 20px;
    border-radius:5px;display:none;z-index:1001;
  `;
  document.body.appendChild(loading);

  /* ===== PICK IMAGE ===== */
  function pickImage() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;
      originalSrc = avatarImg.src;
      avatarPreview.src = URL.createObjectURL(file);
      avatarModal.style.display = "flex";

      cropper?.destroy();
      cropper = new Cropper(avatarPreview, {
        aspectRatio: 1,
        viewMode: 1,
        dragMode: "move",
        cropBoxResizable: false,
        cropBoxMovable: false,
        ready() { avatarActions.style.display = "flex"; }
      });
    };
    input.click();
  }

  avatarEdit.addEventListener("click", pickImage);
  editBtn.onclick = pickImage;

  /* ===== CANCEL ===== */
  cancelBtn.onclick = () => {
    cropper?.destroy();
    cropper = null;
    avatarModal.style.display = "none";
    avatarImg.src = originalSrc;
  };

  /* ===== SAVE ===== */
  saveBtn.onclick = async () => {
    if (!cropper || !userId) return;
    loading.style.display = "flex";

    const canvas = cropper.getCroppedCanvas({ width: 512, height: 512 });
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("avatar", blob, "avatar.png");

      try {
        const res = await fetch("/auth/setup_profile", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Failed to save avatar");
        const data = await res.json();

        cropper.destroy();
        cropper = null;
        avatarModal.style.display = "none";

        // Навсозии аватар ва rows
        avatarImg.src = getAvatarSrc(data.avatar);
        username.textContent = data.username || "";
        bio.textContent = data.bio || "";
        phoneRow.textContent = data.phone || "";
        usernameRow.textContent = data.username || "";
        bioRow.textContent = data.bio || "";
        if (linksRow) linksRow.textContent = data.links || "";

      } catch (err) {
        console.error("Error saving avatar:", err);
        avatarImg.src = originalSrc;
      } finally {
        loading.style.display = "none";
      }
    }, "image/png");
  };

});
