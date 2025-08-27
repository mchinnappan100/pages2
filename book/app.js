// Book Reader State
let currentPageIndex = 0;
let pages = [];
let touchStartX = 0;
let touchEndX = 0;
let isAnimating = false;

// Initialize with sample content
const sampleMarkdown = `# Sample Book Title`;
// Initialize the app
window.addEventListener("load", () => {
  initializeReader();
  parseMarkdownContent(sampleMarkdown);

  // Check for URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const markdownUrl = urlParams.get("url");
  if (markdownUrl) {
    loadFromUrl(markdownUrl);
  }
});

function initializeReader() {
  // Theme switching
  document.querySelectorAll(".theme-btn").forEach((btn) => {
    btn.addEventListener("click", () => setTheme(btn.dataset.theme));
  });

  // File upload
  document
    .getElementById("fileInput")
    .addEventListener("change", handleFileUpload);

  // Touch/swipe events
  const book = document.getElementById("book");
  book.addEventListener("touchstart", handleTouchStart, { passive: true });
  book.addEventListener("touchmove", handleTouchMove, { passive: true });
  book.addEventListener("touchend", handleTouchEnd, { passive: true });

  // Mouse events for desktop
  book.addEventListener("mousedown", handleMouseDown);
  book.addEventListener("mousemove", handleMouseMove);
  book.addEventListener("mouseup", handleMouseEnd);
  book.addEventListener("mouseleave", handleMouseEnd);

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") previousPage();
    if (e.key === "ArrowRight") nextPage();
    if (e.key === "Escape") closeUpload();
  });

  // Show header on mouse move
  let headerTimeout;
  document.addEventListener("mousemove", () => {
    document.querySelector(".header").classList.add("visible");
    clearTimeout(headerTimeout);
    headerTimeout = setTimeout(() => {
      document.querySelector(".header").classList.remove("visible");
    }, 3000);
  });

  // Progress bar
  window.addEventListener("scroll", updateProgress);
}

function setTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem("bookReader-theme", theme);
}

function parseMarkdownContent(markdown) {
  showLoading(true);

  // Split content into pages (approximately 800 words per page)
  const sections = markdown.split(/(?=^#{1,2}\s)/m);
  pages = [];
  let currentPage = "";
  let wordCount = 0;

  sections.forEach((section) => {
    const sectionWords = section.trim().split(/\s+/).length;

    if (wordCount + sectionWords > 800 && currentPage.trim()) {
      pages.push(convertMarkdownToHTML(currentPage));
      currentPage = section;
      wordCount = sectionWords;
    } else {
      currentPage += section;
      wordCount += sectionWords;
    }
  });

  if (currentPage.trim()) {
    pages.push(convertMarkdownToHTML(currentPage));
  }

  renderPages();
  updateNavigation();
  showLoading(false);
}

function convertMarkdownToHTML(markdown) {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gm, "<h1>$1</h1>");

  // Bold and italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Code
  html = html.replace(/`(.*?)`/g, "<code>$1</code>");

  // Blockquotes
  html = html.replace(/^> (.*$)/gm, "<blockquote>$1</blockquote>");

  // Lists
  html = html.replace(/^\- (.*$)/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");

  // Paragraphs
  html = html.replace(/\n\n/g, "</p><p>");
  html = "<p>" + html + "</p>";

  // Clean up
  html = html.replace(/<p><\/p>/g, "");
  html = html.replace(/<p>(<h[1-6]>)/g, "$1");
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, "$1");
  html = html.replace(/<p>(<ul>)/g, "$1");
  html = html.replace(/(<\/ul>)<\/p>/g, "$1");
  html = html.replace(/<p>(<blockquote>)/g, "$1");
  html = html.replace(/(<\/blockquote>)<\/p>/g, "$1");

  return html;
}

function renderPages() {
  const container = document.getElementById("pagesContainer");
  container.innerHTML = "";

  pages.forEach((content, index) => {
    const pageDiv = document.createElement("div");
    pageDiv.className = "page";
    if (index === currentPageIndex) pageDiv.classList.add("active");
    pageDiv.innerHTML = content;
    container.appendChild(pageDiv);
  });

  document.getElementById("totalPages").textContent = pages.length;

  // Set book title from first h1
  const firstH1 = container.querySelector("h1");
  if (firstH1) {
    document.getElementById("bookTitle").textContent = firstH1.textContent;
  }
}

function nextPage() {
  if (isAnimating || currentPageIndex >= pages.length - 1) return;
  navigateToPage(currentPageIndex + 1);
}

function previousPage() {
  if (isAnimating || currentPageIndex <= 0) return;
  navigateToPage(currentPageIndex - 1);
}

function navigateToPage(newIndex) {
  if (newIndex < 0 || newIndex >= pages.length || isAnimating) return;

  isAnimating = true;
  const container = document.getElementById("pagesContainer");
  const currentPage = container.children[currentPageIndex];
  const nextPage = container.children[newIndex];

  // Determine animation direction
  const direction = newIndex > currentPageIndex ? "next" : "prev";

  if (direction === "next") {
    nextPage.style.transform = "translateX(100%)";
    nextPage.classList.add("active");

    setTimeout(() => {
      currentPage.style.transform = "translateX(-100%)";
      nextPage.style.transform = "translateX(0)";
    }, 10);
  } else {
    nextPage.style.transform = "translateX(-100%)";
    nextPage.classList.add("active");

    setTimeout(() => {
      currentPage.style.transform = "translateX(100%)";
      nextPage.style.transform = "translateX(0)";
    }, 10);
  }

  setTimeout(() => {
    currentPage.classList.remove("active");
    currentPage.style.transform =
      direction === "next" ? "translateX(-100%)" : "translateX(100%)";
    currentPageIndex = newIndex;
    updateNavigation();
    isAnimating = false;
  }, 400);
}

function updateNavigation() {
  document.getElementById("currentPage").textContent = currentPageIndex + 1;
  document.getElementById("prevBtn").disabled = currentPageIndex <= 0;
  document.getElementById("nextBtn").disabled =
    currentPageIndex >= pages.length - 1;
  updateProgress();
}

function updateProgress() {
  const progress = ((currentPageIndex + 1) / pages.length) * 100;
  document.getElementById("progressBar").style.width = progress + "%";
}

// Touch and mouse event handlers
let isDragging = false;
let startX = 0;
let currentX = 0;

function handleTouchStart(e) {
  touchStartX = e.touches[0].clientX;
  startX = touchStartX;
}

function handleTouchMove(e) {
  if (!touchStartX) return;
  touchEndX = e.touches[0].clientX;
  currentX = touchEndX;
}

function handleTouchEnd() {
  if (!touchStartX || !touchEndX) return;

  const deltaX = touchStartX - touchEndX;
  const minSwipeDistance = 50;

  if (Math.abs(deltaX) > minSwipeDistance) {
    if (deltaX > 0) {
      nextPage(); // Swipe left - next page
    } else {
      previousPage(); // Swipe right - previous page
    }
  }

  touchStartX = 0;
  touchEndX = 0;
}

function handleMouseDown(e) {
  isDragging = true;
  startX = e.clientX;
  document.getElementById("book").style.cursor = "grabbing";
}

function handleMouseMove(e) {
  if (!isDragging) return;
  currentX = e.clientX;
}

function handleMouseEnd() {
  if (!isDragging) return;

  const deltaX = startX - currentX;
  const minSwipeDistance = 100;

  if (Math.abs(deltaX) > minSwipeDistance) {
    if (deltaX > 0) {
      nextPage();
    } else {
      previousPage();
    }
  }

  isDragging = false;
  document.getElementById("book").style.cursor = "grab";
}

function showUpload() {
  document.getElementById("uploadArea").classList.add("visible");
}

function closeUpload() {
  document.getElementById("uploadArea").classList.remove("visible");
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    parseMarkdownContent(e.target.result);
    closeUpload();
    currentPageIndex = 0;
  };
  reader.readAsText(file);
}

async function loadFromUrl(url) {
  showLoading(true);
  try {
    const response = await fetch(url);
    const content = await response.text();
    parseMarkdownContent(content);
    currentPageIndex = 0;
  } catch (error) {
    console.error("Error loading from URL:", error);
    alert("Failed to load content from URL");
  }
  showLoading(false);
}

function showLoading(show) {
  document.getElementById("loading").classList.toggle("visible", show);
}

// Load saved theme
const savedTheme = localStorage.getItem("bookReader-theme");
if (savedTheme) {
  setTheme(savedTheme);
}

// Smooth scrolling for pages
document.addEventListener(
  "wheel",
  (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      if (e.deltaX > 0) {
        nextPage();
      } else {
        previousPage();
      }
    }
  },
  { passive: false }
);

// Auto-hide header
setTimeout(() => {
  document.querySelector(".header").classList.remove("visible");
}, 3000);
