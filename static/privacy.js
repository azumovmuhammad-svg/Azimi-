function goBack() {
  history.back();
}

// clickable items
document.querySelectorAll(".clickable").forEach(item => {
  item.addEventListener("click", () => {
    const link = item.getAttribute("data-link");
    if (link) {
      window.location.href = link;
    }
  });
});

// switches (demo logic)
document.querySelectorAll(".switch input").forEach(sw => {
  sw.addEventListener("change", () => {
    console.log("Setting changed:", sw.checked);
    // Инҷо метавонед API (fetch) илова кунед
  });
});
