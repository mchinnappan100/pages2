// Get names from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const recipientName =
  urlParams.get("p") ||
  urlParams.get("name") ||
  urlParams.get("n") ||
  "Dear Friend";
const senderName =
  urlParams.get("f") || urlParams.get("from") || "Your Friends & Family";

document.getElementById("recipientName").textContent = recipientName;
document.getElementById("senderName").textContent = senderName;

// Page navigation
let currentPage = 0;
const totalPages = 4;
const pages = document.querySelectorAll(".page");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const indicators = document.querySelectorAll(".indicator-dot");

function updatePage() {
  // Flip pages and set opacity
  pages.forEach((page, index) => {
    page.classList.remove("flipped", "current", "future");

    if (index < currentPage) {
      // Pages that have been flipped - very low opacity
      page.classList.add("flipped");
    } else if (index === currentPage) {
      // Current page - full opacity, top layer
      page.classList.add("current");
    } else {
      // Future pages - normal opacity
      page.classList.add("future");
    }
  });

  // Update buttons
  prevBtn.disabled = currentPage === 0;
  nextBtn.disabled = currentPage === totalPages - 1;

  // Update indicators
  indicators.forEach((dot, index) => {
    dot.classList.toggle("active", index === currentPage);
  });

  // Create confetti on last page
  if (currentPage === totalPages - 1) {
    createConfetti();
  }
}

prevBtn.addEventListener("click", () => {
  if (currentPage > 0) {
    currentPage--;
    updatePage();
  }
});

nextBtn.addEventListener("click", () => {
  if (currentPage < totalPages - 1) {
    currentPage++;
    updatePage();
  }
});

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") prevBtn.click();
  if (e.key === "ArrowRight") nextBtn.click();
});

// Click indicators to jump to page
indicators.forEach((dot, index) => {
  dot.style.cursor = "pointer";
  dot.addEventListener("click", () => {
    currentPage = index;
    updatePage();
  });
});

// Confetti effect
function createConfetti() {
  const colors = ["#ff6b9d", "#fecfef", "#ffd4e5", "#ff9a9e", "#ffb3ba"];
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const confetti = document.createElement("div");
      confetti.style.cssText = `
            position: fixed;
            left: ${Math.random() * 100}%;
            top: -10px;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            animation: confetti-fall ${Math.random() * 3 + 3}s linear;
            pointer-events: none;
            z-index: 1000;
          `;
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 6000);
    }, i * 50);
  }
}

// Add confetti animation
const style = document.createElement("style");
style.textContent = `
      @keyframes confetti-fall {
        to {
          transform: translateY(100vh) rotate(360deg);
          opacity: 0;
        }
      }
      @keyframes pulse {
        0%, 100% { opacity: 0.7; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.05); }
      }
    `;
document.head.appendChild(style);
