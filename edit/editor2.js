// editor.js - Full VS Code-like Web Editor with Fixed Vim Mode
let editor = null;
let currentFile = "welcome.md";
let currentLanguage = "markdown";
let openFiles = {};
let vimMode = null;
let isVimEnabled = false;
let vimLoaded = false;
let vimLoading = false;
let vimLoadPromise = null;
let autoSaveInterval = null;

const themes = ["vs-dark", "vs", "hc-black"];
let currentTheme = 0;

// === Lazy load monaco-vim only when needed ===
function loadMonacoVim() {
  if (vimLoaded) return Promise.resolve();
  if (vimLoadPromise) return vimLoadPromise;

  vimLoading = true;
  const toggle = document.getElementById("vimToggle");
  toggle.textContent = "Vim: Loading...";
  toggle.style.opacity = "0.7";

  vimLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    // FIXED: Correct CDN for latest version (0.4.2) - confirmed working Nov 2025
    script.src = "https://unpkg.com/monaco-vim@0.4.2/dist/monaco-vim.js";
    script.onload = () => {
      console.log("Monaco-Vim loaded successfully from unpkg");
      vimLoaded = true;
      vimLoading = false;
      toggle.textContent = "Vim: OFF";
      toggle.style.opacity = "";
      document.getElementById("vimModeToggle")?.removeAttribute("disabled");
      resolve();
    };
    script.onerror = (err) => {
      console.error("Vim script load error:", err);
      vimLoading = false;
      toggle.textContent = "Vim: Failed";
      showNotification("Failed to load Vim mode (network error). Try refreshing.");
      reject(err);
    };
    document.head.appendChild(script);
  });

  return vimLoadPromise;
}
// === Reliable Vim Toggle ===
function toggleVimMode() {
  if (vimLoading) {
    showNotification("Vim is still loading...");
    return;
  }

  if (!vimLoaded) {
    showNotification("Loading Vim mode...");
    loadMonacoVim().then(() => {
      isVimEnabled = true;
      enableVim();
    }).catch(() => {
      isVimEnabled = false;
      updateVimUI();
    });
    return;
  }

  isVimEnabled = !isVimEnabled;
  if (isVimEnabled) enableVim();
  else disableVim();
}

function enableVim() {
  if (vimMode) return;

  const statusNode = document.getElementById("vimStatus");
  try {
    vimMode = MonacoVim.initVimMode(editor, statusNode);
    updateVimUI();
    showNotification("Vim mode enabled");
  } catch (err) {
    console.error("Vim init failed:", err);
    isVimEnabled = false;
    updateVimUI();
    showNotification("Failed to enable Vim mode");
  }
}

function disableVim() {
  if (vimMode) {
    vimMode.dispose();
    vimMode = null;
  }
  updateVimUI();
  showNotification("Vim mode disabled");
}

function updateVimUI() {
  const toggle = document.getElementById("vimToggle");
  const checkbox = document.getElementById("vimModeToggle");
  const status = document.getElementById("vimStatus");

  if (isVimEnabled && vimMode) {
    toggle.textContent = "Vim: ON";
    toggle.style.background = "#007acc";
    status.style.display = "inline";
    checkbox.checked = true;
  } else {
    toggle.textContent = vimLoaded ? "Vim: OFF" : "Vim: Click to load";
    toggle.style.background = "rgba(255,255,255,0.1)";
    status.style.display = "none";
    checkbox.checked = false;
  }
}

// === Initialize Monaco Editor ===
require.config({
  paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.47.0/min/vs" },
});

require(["vs/editor/editor.main"], function () {
  editor = monaco.editor.create(document.getElementById("monacoEditor"), {
    value: fileContents["welcome.md"],
    language: "markdown",
    theme: "vs-dark",
    automaticLayout: true,
    fontSize: 14,
    lineNumbers: "on",
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    wordWrap: "on",
    formatOnPaste: true,
    formatOnType: true,
    tabSize: 2,
    insertSpaces: true,
    renderWhitespace: "selection",
    bracketPairColorization: { enabled: true },
    guides: { indentation: true, bracketPairs: true },
    suggestOnTriggerCharacters: true,
    quickSuggestions: true,
    folding: true,
    foldingStrategy: "indentation",
  });

  openFiles["welcome.md"] = fileContents["welcome.md"];

  // Cursor position
  editor.onDidChangeCursorPosition((e) => {
    document.getElementById("statusPosition").textContent = `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
  });

  // Save on change
  editor.onDidChangeModelContent(() => {
    openFiles[currentFile] = editor.getValue();
  });

  // Initial UI
  updateVimUI();
});

// === File Management ===
function openFile(fileName, language) {
  currentFile = fileName;
  currentLanguage = language;

  document.querySelectorAll(".file-item").forEach(item => {
    item.classList.remove("active");
    if (item.textContent.includes(fileName)) item.classList.add("active");
  });

  if (!openFiles[fileName]) {
    openFiles[fileName] = fileContents[fileName] || "";
  }

  monaco.editor.setModelLanguage(editor.getModel(), language);
  editor.setValue(openFiles[fileName]);

  document.getElementById("statusLanguage").textContent =
    language.charAt(0).toUpperCase() + language.slice(1);

  addOrSwitchTab(fileName);
}

function addOrSwitchTab(fileName) {
  const tabsBar = document.getElementById("tabsBar");
  const existing = Array.from(tabsBar.children).find(t => t.dataset.file === fileName);

  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));

  if (existing) {
    existing.classList.add("active");
  } else {
    const icon = getFileIcon(fileName);
    const tab = document.createElement("div");
    tab.className = "tab active";
    tab.dataset.file = fileName;
    tab.innerHTML = `${icon} ${fileName} <span class="tab-close" onclick="closeTab(event, '${fileName}')">×</span>`;
    tab.onclick = (e) => { if (!e.target.classList.contains("tab-close")) switchToTab(fileName); };
    tabsBar.appendChild(tab);
  }
}

function switchToTab(fileName) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  const tab = Array.from(document.querySelectorAll(".tab")).find(t => t.dataset.file === fileName);
  if (tab) {
    tab.classList.add("active");
    openFile(fileName, getLanguageFromFileName(fileName));
  }
}

function closeTab(e, fileName) {
  e.stopPropagation();
  const tab = Array.from(document.querySelectorAll(".tab")).find(t => t.dataset.file === fileName);
  if (!tab) return;

  const wasActive = tab.classList.contains("active");
  tab.remove();
  delete openFiles[fileName];

  if (wasActive && document.querySelectorAll(".tab").length > 0) {
    const last = document.querySelector(".tab");
    switchToTab(last.dataset.file);
  } else if (!document.querySelector(".tab")) {
    editor.setValue("");
  }
}

function deleteFile(e, fileName) {
  e.stopPropagation();
  if (!confirm(`Delete ${fileName}?`)) return;

  document.querySelectorAll(".file-item").forEach(item => {
    if (item.textContent.includes(fileName)) item.remove();
  });

  const tab = Array.from(document.querySelectorAll(".tab")).find(t => t.dataset.file === fileName);
  if (tab) closeTab({ stopPropagation: () => {} }, fileName);

  delete openFiles[fileName];
  delete fileContents[fileName];
  showNotification(`Deleted ${fileName}`);
}

// === Icons & Languages ===
function getFileIcon(fileName) {
  const ext = fileName.split(".").pop().toLowerCase();
  const map = {
    js: "JS", ts: "TS", jsx: "React", tsx: "React", html: "HTML", css: "CSS", json: "JSON",
    md: "MD", py: "Python", java: "Java", cpp: "C++", go: "Go", rs: "Rust", php: "PHP", rb: "Ruby", sql: "SQL"
  };
  return map[ext] || "File";
}

function getLanguageFromFileName(fileName) {
  const map = {
    js: "javascript", ts: "typescript", jsx: "javascript", tsx: "typescript",
    html: "html", css: "css", json: "json", md: "markdown", py: "python",
    java: "java", cpp: "cpp", go: "go", rs: "rust", php: "php", rb: "ruby", sql: "sql"
  };
  return map[fileName.split(".").pop().toLowerCase()] || "plaintext";
}

// === New File ===
function openNewFileDialog() {
  document.getElementById("newFileModal").classList.add("active");
  document.getElementById("newFileName").focus();
}

function createNewFile() {
  const name = document.getElementById("newFileName").value.trim();
  const lang = document.getElementById("newFileLanguage").value;
  if (!name) return alert("Enter a file name");

  closeModal("newFileModal");
  fileContents[name] = "";
  openFile(name, lang);

  const item = document.createElement("div");
  item.className = "file-item";
  item.onclick = () => openFile(name, lang);
  item.innerHTML = `${getFileIcon(name)} ${name} <span class="delete-btn" onclick="deleteFile(event, '${name}')">×</span>`;
  document.getElementById("fileTree").insertBefore(item, document.getElementById("fileTree").lastElementChild);
  showNotification(`Created ${name}`);
}

// === Download ===
function downloadFile() {
  const blob = new Blob([editor.getValue()], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = currentFile; a.click();
  URL.revokeObjectURL(url);
  showNotification(`Downloaded ${currentFile}`);
}

// === Settings ===
function openSettings() { document.getElementById("settingsModal").classList.add("active"); }
function changeFontSize(size) { editor.updateOptions({ fontSize: +size }); document.getElementById("fontSizeValue").textContent = size + "px"; }
function toggleWordWrap() { editor.updateOptions({ wordWrap: document.getElementById("wordWrapToggle").checked ? "on" : "off" }); }
function toggleMinimap() { editor.updateOptions({ minimap: { enabled: document.getElementById("minimapToggle").checked } }); }
function toggleLineNumbers() { editor.updateOptions({ lineNumbers: document.getElementById("lineNumbersToggle").checked ? "on" : "off" }); }

function toggleAutoSave() {
  const enabled = document.getElementById("autoSaveToggle").checked;
  if (enabled) {
    autoSaveInterval = setInterval(() => {
      openFiles[currentFile] = editor.getValue();
      console.log("Auto-saved:", currentFile);
    }, 3000);
    showNotification("Auto-save enabled");
  } else {
    clearInterval(autoSaveInterval);
    showNotification("Auto-save disabled");
  }
}

function changeTheme() {
  currentTheme = (currentTheme + 1) % themes.length;
  monaco.editor.setTheme(themes[currentTheme]);
  showNotification(`Theme: ${themes[currentTheme] === "vs-dark" ? "Dark" : themes[currentTheme] === "vs" ? "Light" : "High Contrast"}`);
}

// === Command Palette ===
function toggleCommandPalette() {
  const p = document.getElementById("commandPalette");
  p.classList.toggle("active");
  if (p.classList.contains("active")) document.getElementById("commandInput").focus();
}

document.getElementById("commandInput")?.addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll("#commandList .command-item").forEach(item => {
    item.style.display = item.textContent.toLowerCase().includes(q) ? "flex" : "none";
  });
});

document.getElementById("commandInput")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const first = document.querySelector("#commandList .command-item[style*='flex']");
    if (first) { first.click(); toggleCommandPalette(); }
  }
});

// === Explorer & Modals ===
function toggleExplorer() { document.getElementById("explorer").classList.toggle("visible"); }
function closeModal(id) { document.getElementById(id).classList.remove("active"); }

// === Notifications ===
function showNotification(msg) {
  const n = document.createElement("div");
  n.className = "notification";
  n.textContent = msg;
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 3000);
}

// === Misc ===
function showSearch() { editor.trigger("", "actions.find"); }
function formatDocument() { editor.getAction("editor.action.formatDocument").run(); showNotification("Formatted"); }
function showHelp() { alert("Check console or status bar for shortcuts!"); }
function openNewFile() { openNewFileDialog(); }

// === Global Keyboard Shortcuts ===
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === "P") { e.preventDefault(); toggleCommandPalette(); }
  if (e.ctrlKey && e.key === "n") { e.preventDefault(); openNewFileDialog(); }
  if (e.ctrlKey && e.key === "s") { e.preventDefault(); downloadFile(); }
  if (e.ctrlKey && e.key === ",") { e.preventDefault(); openSettings(); }
  if (e.ctrlKey && e.shiftKey && e.key === "E") { e.preventDefault(); toggleExplorer(); }
  if (e.ctrlKey && e.shiftKey && e.key === "V") { e.preventDefault(); toggleVimMode(); }
  if (e.key === "Escape") {
    document.querySelectorAll(".modal, .command-palette").forEach(el => el.classList.remove("active"));
  }
});

// Close palette on outside click
document.addEventListener("click", (e) => {
  const palette = document.getElementById("commandPalette");
  if (palette.classList.contains("active") && !palette.contains(e.target)) {
    palette.classList.remove("active");
  }
});