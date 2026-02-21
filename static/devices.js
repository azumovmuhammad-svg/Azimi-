const ua = navigator.userAgent;

let device = "Unknown Device";
let os = "Unknown OS";

if (/Android/i.test(ua)) {
  os = "Android";
  device = "Android Phone";
} else if (/iPhone/i.test(ua)) {
  os = "iOS";
  device = "iPhone";
} else if (/iPad/i.test(ua)) {
  os = "iPadOS";
  device = "iPad";
} else if (/Windows/i.test(ua)) {
  os = "Windows";
  device = "PC";
} else if (/Mac/i.test(ua)) {
  os = "macOS";
  device = "Mac";
}

document.getElementById("deviceName").innerText = device;
document.getElementById("deviceMeta").innerText =
  "Last active: Now • " + os;

document.getElementById("location").innerText = os;
