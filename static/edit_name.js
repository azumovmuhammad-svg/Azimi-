console.log("EDIT NAME JS LOADED");

document.addEventListener("DOMContentLoaded", async () => {
  const input = document.getElementById("nameInput");
  const saveBtn = document.getElementById("saveBtn");
  const counter = document.getElementById("charCount");

  // realtime counter
  input.addEventListener("input", () => {
    counter.textContent = `${input.value.length}/40`;
  });

  // LOAD CURRENT NAME
  try {
    const res = await fetch("/auth/profile");
    if (!res.ok) throw new Error("Failed to load profile");

    const data = await res.json();
    input.value = data.username || "";
    counter.textContent = `${input.value.length}/40`; // муҳим
  } catch (e) {
    console.error(e);
  }
});


  // SAVE
  saveBtn.addEventListener("click", async () => {
    const value = input.value.trim();

    if (!value) {
      alert("Name cannot be empty");
      return;
    }

    try {
      const res = await fetch("/profile/name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: value })
      });

      if (res.ok) {
        window.location.href = "/profile";
      } else {
        alert("Failed to save");
      }
    } catch (e) {
      console.error(e);
    }
  });
});
