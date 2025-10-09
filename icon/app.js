// Theme Management
const themeToggle = document.getElementById("themeToggle");
const sunIcon = document.getElementById("sunIcon");
const moonIcon = document.getElementById("moonIcon");
const htmlElement = document.documentElement;

// Debug: Check if elements are found
if (!themeToggle || !sunIcon || !moonIcon || !htmlElement) {
  console.error("Theme toggle elements not found:", {
    themeToggle: !!themeToggle,
    sunIcon: !!sunIcon,
    moonIcon: !!moonIcon,
    htmlElement: !!htmlElement,
  });
}

// Initialize theme based on localStorage or default to light
const currentTheme = localStorage.getItem("theme") || "light";
console.log("Initial theme:", currentTheme);
if (currentTheme === "dark") {
  htmlElement.classList.add("dark");
  sunIcon.classList.remove("hidden");
  sunIcon.classList.add("block");
  moonIcon.classList.add("hidden");
  moonIcon.classList.remove("block");
} else {
  htmlElement.classList.remove("dark");
  sunIcon.classList.add("hidden");
  sunIcon.classList.remove("block");
  moonIcon.classList.remove("hidden");
  moonIcon.classList.add("block");
}

// Theme toggle event listener
themeToggle.addEventListener("click", () => {
  console.log("Theme toggle clicked");
  htmlElement.classList.toggle("dark");
  const isDarkMode = htmlElement.classList.contains("dark");
  console.log("Is dark mode:", isDarkMode);

  // Update localStorage
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");

  // Toggle icons
  sunIcon.classList.toggle("hidden", !isDarkMode);
  sunIcon.classList.toggle("block", isDarkMode);
  moonIcon.classList.toggle("hidden", isDarkMode);
  moonIcon.classList.toggle("block", !isDarkMode);

  console.log(
    "Updated classes - html:",
    htmlElement.className,
    "sunIcon:",
    sunIcon.className,
    "moonIcon:",
    moonIcon.className
  );
});

// DOM elements for icon generation
const iconText = document.getElementById("iconText");
const fontSelect = document.getElementById("fontSelect");
const fontColor = document.getElementById("fontColor");
const fontColorDisplay = document.getElementById("fontColorDisplay");
const fontColorHex = document.getElementById("fontColorHex");
const bgColor = document.getElementById("bgColor");
const bgColorDisplay = document.getElementById("bgColorDisplay");
const bgColorHex = document.getElementById("bgColorHex");
const cornerRadius = document.getElementById("cornerRadius");
const fontSize = document.getElementById("fontSize");
const fontSizeValue = document.getElementById("fontSizeValue");
const iconForm = document.getElementById("iconForm");
const icon16 = document.getElementById("icon16");
const icon48 = document.getElementById("icon48");
const icon64 = document.getElementById("icon64");
const icon128 = document.getElementById("icon128");
const download16 = document.getElementById("download16");
const download48 = document.getElementById("download48");
const download64 = document.getElementById("download64");
const download128 = document.getElementById("download128");
const downloadStatus = document.getElementById("downloadStatus");
const previewCanvas = document.getElementById("previewCanvas");
const output = document.getElementById("output");
const popup = document.getElementById("popup");
const popupOverlay = document.getElementById("popupOverlay");
const popupMessage = document.getElementById("popupMessage");
const popupClose = document.getElementById("popupClose");

// Popup functions
function showPopup(message) {
  popupMessage.textContent = message;
  popup.classList.remove("hidden");
  popupOverlay.classList.remove("hidden");
}

function hidePopup() {
  popup.classList.add("hidden");
  popupOverlay.classList.add("hidden");
}

popupClose.addEventListener("click", hidePopup);
popupOverlay.addEventListener("click", hidePopup);

// Update color displays
function updateColorDisplays() {
  const fontColorValue = fontColor.value;
  const bgColorValue = bgColor.value;

  fontColorDisplay.style.backgroundColor = fontColorValue;
  fontColorHex.textContent = fontColorValue.toUpperCase();
  bgColorDisplay.style.backgroundColor = bgColorValue;
  bgColorHex.textContent = bgColorValue.toUpperCase();
  fontSizeValue.textContent = fontSize.value + "%";

  updatePreview();
}

// Update preview
function updatePreview() {
  const ctx = previewCanvas.getContext("2d");
  const text = iconText.value.trim() || "A";
  const font = fontSelect.value;
  const fontColorValue = fontColor.value;
  const bgColorValue = bgColor.value;
  const radius = parseInt(cornerRadius.value) || 4;
  const fontSizePercent = parseInt(fontSize.value) || 50;

  ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

  // Draw background with rounded corners
  ctx.fillStyle = bgColorValue;
  roundedRect(ctx, 0, 0, previewCanvas.width, previewCanvas.height, radius);
  ctx.fill();

  // Draw text with adjustable font size
  ctx.fillStyle = fontColorValue;
  const calculatedFontSize =
    (previewCanvas.width / 2) * (fontSizePercent / 100);
  ctx.font = `bold ${calculatedFontSize}px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, previewCanvas.width / 2, previewCanvas.height / 2);
}

// Draw rounded rectangle
function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Generate icons
function generateIcons() {
  const text = iconText.value.trim();
  if (!text) {
    showPopup("Please enter some text for the icon.");
    return;
  }

  const font = fontSelect.value;
  const fontColorValue = fontColor.value;
  const bgColorValue = bgColor.value;
  const radius = parseInt(cornerRadius.value) || 4;
  const fontSizePercent = parseInt(fontSize.value) || 50;

  const sizes = [
    { canvas: icon16, width: 16, height: 16, download: download16 },
    { canvas: icon48, width: 48, height: 48, download: download48 },
    { canvas: icon64, width: 64, height: 64, download: download64 },
    { canvas: icon128, width: 128, height: 128, download: download128 },
  ];

  sizes.forEach(({ canvas, width, height, download }) => {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);

    // Draw background with rounded corners
    ctx.fillStyle = bgColorValue;
    roundedRect(ctx, 0, 0, width, height, radius);
    ctx.fill();

    // Draw text with adjustable font size
    ctx.fillStyle = fontColorValue;
    const calculatedFontSize = (width / 2) * (fontSizePercent / 100);
    ctx.font = `bold ${calculatedFontSize}px ${font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, width / 2, height / 2);

    // Set up download link
    download.href = canvas.toDataURL("image/png");
    download.download = `icon${width}x${height}.png`;
  });

  output.classList.remove("hidden");
  showPopup("Icons generated successfully! Click the links to download.");
}

// Handle download clicks
function setupDownloadListeners() {
  [download16, download48, download64, download128].forEach((link) => {
    link.addEventListener("click", () => {
      downloadStatus.textContent = `Downloading ${link.download}...`;
      setTimeout(() => (downloadStatus.textContent = ""), 3000);
    });
  });
}

// Event Listeners
iconForm.addEventListener("submit", (e) => {
  e.preventDefault();
  generateIcons();
});

[iconText, fontSelect, fontColor, bgColor, cornerRadius, fontSize].forEach(
  (element) => {
    element.addEventListener("input", updateColorDisplays);
  }
);

// Initial setup
updateColorDisplays();
setupDownloadListeners();

// Debug: Log Tailwind dark mode status
console.log(
  "Tailwind dark mode enabled:",
  window.getComputedStyle(document.body).getPropertyValue("background-color")
);
