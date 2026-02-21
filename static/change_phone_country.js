const searchInput = document.getElementById("searchInput");
const items = document.querySelectorAll(".item");

// SEARCH
searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();
  items.forEach(item => {
    const name = item.dataset.name.toLowerCase();
    item.style.display = name.includes(q) ? "flex" : "none";
  });
});

// SELECT COUNTRY
items.forEach(item => {
  item.addEventListener("click", () => {
    localStorage.setItem("countryName", item.dataset.name);
    localStorage.setItem("countryCode", item.dataset.code);
    history.back();
  });
});
