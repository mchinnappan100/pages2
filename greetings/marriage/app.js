// Card flip functionality

// Get recipient name from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const recipient = urlParams.get("p");
if (recipient) {
  const recipientElement = document.querySelector(".recipient");
  recipientElement.textContent =
    "To: " + recipient.charAt(0).toUpperCase() + recipient.slice(1) ;
}

const from = urlParams.get("f");
if (from) {
  const fromElement = document.querySelector(".from");
  fromElement.textContent = from;
}


const card = document.getElementById("weddingCard");
card.addEventListener("click", function () {
  this.classList.toggle("flipped");
});

// Create floating hearts
function createHeart(container) {
  const heart = document.createElement("div");
  heart.className = "heart";
  heart.textContent = "💕";
  heart.style.left = Math.random() * 100 + "%";
  heart.style.animationDelay = Math.random() * 5 + "s";
  heart.style.fontSize = Math.random() * 20 + 20 + "px";
  container.appendChild(heart);
}

// Generate hearts for both sides
const heartsFront = document.getElementById("hearts");
const heartsBack = document.getElementById("hearts-back");

for (let i = 0; i < 15; i++) {
  createHeart(heartsFront);
  createHeart(heartsBack);
}

// Create confetti effect
function createConfetti() {
  const colors = [
    "#ff0080",
    "#ff8c00",
    "#ffd700",
    "#00ff00",
    "#00ffff",
    "#ff00ff",
  ];
  const confetti = document.createElement("div");
  confetti.className = "confetti";
  confetti.style.left = Math.random() * 100 + "%";
  confetti.style.backgroundColor =
    colors[Math.floor(Math.random() * colors.length)];
  confetti.style.animationDelay = Math.random() * 3 + "s";
  confetti.style.animationDuration = Math.random() * 2 + 3 + "s";
  document.querySelector(".card-front").appendChild(confetti);

  setTimeout(() => confetti.remove(), 5000);
}

// Generate confetti periodically
setInterval(createConfetti, 300);

// Add keyboard support
document.addEventListener("keydown", function (e) {
  if (e.key === "Enter" || e.key === " ") {
    card.classList.toggle("flipped");
  }
});
