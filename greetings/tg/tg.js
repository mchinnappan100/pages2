// tg.js
const book = document.getElementById("book");
const instruction = document.getElementById("instruction");
let isOpen = false;

book.addEventListener("click", () => {
  isOpen = !isOpen;
  if (isOpen) {
    book.classList.add("open");
    instruction.textContent = "Click again to close";
  } else {
    book.classList.remove("open");
    instruction.textContent = "Click the card to open!";
  }
});

// Get recipient name from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const recipient = urlParams.get("p");
if (recipient) {
  const recipientElement = document.querySelector(".recipient");
  recipientElement.textContent =
    "To: " + recipient.charAt(0).toUpperCase() + recipient.slice(1);
}
