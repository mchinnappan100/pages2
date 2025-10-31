// Create stars
const starsContainer = document.getElementById("stars");
for (let i = 0; i < 100; i++) {
  const star = document.createElement("div");
  star.className = "star";
  star.style.width = Math.random() * 3 + "px";
  star.style.height = star.style.width;
  star.style.left = Math.random() * 100 + "%";
  star.style.top = Math.random() * 100 + "%";
  star.style.animationDelay = Math.random() * 2 + "s";
  starsContainer.appendChild(star);
}

const messageArea = document.getElementById("messageArea");
const trickBtn = document.getElementById("trickBtn");
const treatBtn = document.getElementById("treatBtn");

const trickMessages = [
  "👻 BOO! Did I scare you?",
  "🕷️ A spider just crawled up your back!",
  "🦇 Watch out! Bats overhead!",
  "💀 The skeletons are dancing tonight!",
  "🧟 Zombies are coming... RUN!",
  "🧙‍♀️ The witch casts a spell on you!",
  "😱 Something's lurking in the shadows...",
  "🎃 The pumpkins are alive!",
];

const treatMessages = [
  "🍬 Here's some candy corn for you!",
  "🍫 Chocolate bars galore!",
  "🍭 Lollipops for the sweet tooth!",
  "🍪 Freshly baked Halloween cookies!",
  "🧁 Spooky cupcakes with ghost frosting!",
  "🍩 Donut worry, be scary!",
  "🎂 A slice of pumpkin pie!",
  "🍰 Candy apple treats!",
];

function createParticles(emoji, x, y) {
  for (let i = 0; i < 15; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.textContent = emoji;
    particle.style.left = x + "px";
    particle.style.top = y + "px";
    particle.style.fontSize = Math.random() * 20 + 20 + "px";
    particle.style.transform = `translateX(${Math.random() * 200 - 100}px)`;
    document.body.appendChild(particle);

    setTimeout(() => particle.remove(), 3000);
  }
}

function showMessage(messages, color, emoji) {
  const message = messages[Math.floor(Math.random() * messages.length)];
  messageArea.innerHTML = `
                <div class="message-bubble card rounded-2xl p-6 text-center">
                    <p class="text-2xl md:text-3xl ${color} font-bold">${message}</p>
                </div>
            `;
}

trickBtn.addEventListener("click", (e) => {
  const rect = e.target.getBoundingClientRect();
  createParticles("👻", rect.left + rect.width / 2, rect.top);
  showMessage(trickMessages, "text-orange-400", "👻");

  // Play spooky sound effect (optional - you can add this)
  // new Audio('spooky-sound.mp3').play();
});

treatBtn.addEventListener("click", (e) => {
  const rect = e.target.getBoundingClientRect();
  createParticles("🍬", rect.left + rect.width / 2, rect.top);
  showMessage(treatMessages, "text-purple-400", "🍬");

  // Play treat sound effect (optional - you can add this)
  // new Audio('treat-sound.mp3').play();
});

// Initial welcome message
window.addEventListener("load", () => {
  messageArea.innerHTML = `
                <div class="message-bubble card rounded-2xl p-6 text-center">
                    <p class="text-xl md:text-2xl text-gray-300">
                        Welcome, brave soul! 🎃<br>
                        Choose wisely... will it be a trick or a treat?
                    </p>
                </div>
            `;
});

// Random floating emojis
setInterval(() => {
  const emojis = ["👻", "🦇", "🕷️", "🍬", "🎃", "💀", "🧙‍♀️"];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  const x = Math.random() * window.innerWidth;
  const particle = document.createElement("div");
  particle.className = "particle";
  particle.textContent = emoji;
  particle.style.left = x + "px";
  particle.style.top = "100vh";
  particle.style.fontSize = Math.random() * 30 + 20 + "px";
  document.body.appendChild(particle);

  setTimeout(() => particle.remove(), 3000);
}, 3000);
