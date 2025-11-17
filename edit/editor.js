let editor = null;
let currentFile = "welcome.md";
let currentLanguage = "markdown";
let openFiles = {};
let vimMode = null;
let isVimEnabled = false;
let vimLoaded = false;
let pendingVimClicks = 0;
let autoSaveInterval = null;

const themes = ["vs-dark", "vs", "hc-black"];
let currentTheme = 0;

// Initialize Monaco Editor
require.config({
  paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.47.0/min/vs" },
});

require(["vs/editor/editor.main"], function () {
  // Load Vim mode extension
  const script = document.createElement("script");
  script.src = "https://unpkg.com/monaco-vim@0.4.0/dist/monaco-vim.js";
  // Disable the settings checkbox until the extension is ready
  document.getElementById("vimModeToggle")?.setAttribute("disabled", "true");
  const vimToggleEl = document.getElementById("vimToggle");
  if (vimToggleEl) {
    vimToggleEl.textContent = 'Vim: Loading...';
    vimToggleEl.style.opacity = '0.7';
    vimToggleEl.style.cursor = 'default';
  }

  script.onload = () => {
    console.log("Monaco Vim loaded");
    vimLoaded = true;
    // Re-enable the checkbox and update UI
    const cb = document.getElementById("vimModeToggle");
    if (cb) cb.removeAttribute("disabled");
    if (vimToggleEl) {
      vimToggleEl.textContent = 'Vim: OFF';
      vimToggleEl.style.opacity = '';
      vimToggleEl.style.cursor = 'pointer';
    }
    // If user clicked the toggle while loading, apply queued toggles
    if (pendingVimClicks > 0) {
      if (pendingVimClicks % 2 === 1) {
        // perform a single toggle to match odd number of clicks
        toggleVimMode();
      }
      pendingVimClicks = 0;
    }
  };
  document.head.appendChild(script);

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
    guides: {
      indentation: true,
      bracketPairs: true,
    },
    suggestOnTriggerCharacters: true,
    quickSuggestions: true,
    folding: true,
    foldingStrategy: "indentation",
  });

  openFiles["welcome.md"] = fileContents["welcome.md"];

  // Update cursor position
  editor.onDidChangeCursorPosition((e) => {
    document.getElementById(
      "statusPosition"
    ).textContent = `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
  });

  // Update content on change
  editor.onDidChangeModelContent(() => {
    openFiles[currentFile] = editor.getValue();
  });
});

// File Management
function openFile(fileName, language) {
  currentFile = fileName;
  currentLanguage = language;

  // Update active state in file tree
  document.querySelectorAll(".file-item").forEach((item) => {
    item.classList.remove("active");
    if (item.textContent.includes(fileName)) {
      item.classList.add("active");
    }
  });

  // Load or create file content
  if (!openFiles[fileName]) {
    openFiles[fileName] = fileContents[fileName] || "";
  }

  // Update editor
  monaco.editor.setModelLanguage(editor.getModel(), language);
  editor.setValue(openFiles[fileName]);

  // Update status bar
  document.getElementById("statusLanguage").textContent =
    language.charAt(0).toUpperCase() + language.slice(1);

  // Add or switch to tab
  addOrSwitchTab(fileName);
}

function addOrSwitchTab(fileName) {
  const tabsBar = document.getElementById("tabsBar");
  const existingTab = Array.from(tabsBar.children).find(
    (tab) => tab.dataset.file === fileName
  );

  if (existingTab) {
    // Switch to existing tab
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));
    existingTab.classList.add("active");
  } else {
    // Create new tab
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));

    const icon = getFileIcon(fileName);
    const tab = document.createElement("div");
    tab.className = "tab active";
    tab.dataset.file = fileName;
    tab.innerHTML = `
        ${icon} ${fileName}
        <span class="tab-close" onclick="closeTab(event, '${fileName}')">×</span>
      `;
    tab.onclick = (e) => {
      if (!e.target.classList.contains("tab-close")) {
        switchToTab(fileName);
      }
    };
    tabsBar.appendChild(tab);
  }
}

function switchToTab(fileName) {
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));
  const tab = Array.from(document.querySelectorAll(".tab")).find(
    (t) => t.dataset.file === fileName
  );
  if (tab) {
    tab.classList.add("active");
    const language = getLanguageFromFileName(fileName);
    openFile(fileName, language);
  }
}

function closeTab(event, fileName) {
  event.stopPropagation();
  const tab = Array.from(document.querySelectorAll(".tab")).find(
    (t) => t.dataset.file === fileName
  );

  if (tab) {
    const wasActive = tab.classList.contains("active");
    tab.remove();
    delete openFiles[fileName];

    if (wasActive) {
      const remainingTabs = document.querySelectorAll(".tab");
      if (remainingTabs.length > 0) {
        const lastTab = remainingTabs[remainingTabs.length - 1];
        switchToTab(lastTab.dataset.file);
      } else {
        editor.setValue("");
      }
    }
  }
}

function deleteFile(event, fileName) {
  event.stopPropagation();
  if (confirm(`Are you sure you want to delete ${fileName}?`)) {
    // Remove from file tree
    const fileItem = Array.from(document.querySelectorAll(".file-item")).find(
      (item) => item.textContent.includes(fileName)
    );
    if (fileItem) {
      fileItem.remove();
    }

    // Close tab if open
    const tab = Array.from(document.querySelectorAll(".tab")).find(
      (t) => t.dataset.file === fileName
    );
    if (tab) {
      closeTab(event, fileName);
    }

    // Delete from memory
    delete openFiles[fileName];
    delete fileContents[fileName];

    showNotification(`Deleted ${fileName}`);
  }
}

function getFileIcon(fileName) {
  const ext = fileName.split(".").pop().toLowerCase();
  const icons = {
    js: "📜",
    ts: "📘",
    jsx: "⚛️",
    tsx: "⚛️",
    html: "🌐",
    css: "🎨",
    scss: "🎨",
    sass: "🎨",
    json: "📋",
    xml: "📋",
    yaml: "📋",
    yml: "📋",
    md: "📄",
    txt: "📄",
    py: "🐍",
    java: "☕",
    cpp: "⚙️",
    c: "⚙️",
    go: "🔵",
    rs: "🦀",
    php: "🐘",
    rb: "💎",
    sql: "🗄️",
    sh: "🖥️",
    bat: "🖥️",
  };
  return icons[ext] || "📄";
}

function getLanguageFromFileName(fileName) {
  const ext = fileName.split(".").pop().toLowerCase();
  const langMap = {
    js: "javascript",
    ts: "typescript",
    jsx: "javascript",
    tsx: "typescript",
    html: "html",
    htm: "html",
    css: "css",
    scss: "scss",
    sass: "sass",
    less: "less",
    json: "json",
    xml: "xml",
    yaml: "yaml",
    yml: "yaml",
    md: "markdown",
    txt: "plaintext",
    py: "python",
    java: "java",
    cpp: "cpp",
    c: "c",
    h: "cpp",
    cs: "csharp",
    go: "go",
    rs: "rust",
    php: "php",
    rb: "ruby",
    sql: "sql",
    sh: "shell",
    bat: "bat",
    ps1: "powershell",
  };
  return langMap[ext] || "plaintext";
}

// New File Dialog
function openNewFileDialog() {
  document.getElementById("newFileModal").classList.add("active");
  document.getElementById("newFileName").focus();
  document.getElementById("newFileName").value = "";
}

function createNewFile() {
  const fileName = document.getElementById("newFileName").value.trim();
  const language = document.getElementById("newFileLanguage").value;

  if (!fileName) {
    alert("Please enter a file name");
    return;
  }

  closeModal("newFileModal");

  // Add to file contents
  fileContents[fileName] = "";

  openFile(fileName, language);

  // Add to file tree
  const fileTree = document.getElementById("fileTree");
  const newFileItem = document.createElement("div");
  newFileItem.className = "file-item";
  newFileItem.onclick = () => openFile(fileName, language);
  newFileItem.innerHTML = `${getFileIcon(
    fileName
  )} ${fileName} <span class="delete-btn" onclick="deleteFile(event, '${fileName}')">×</span>`;
  fileTree.insertBefore(newFileItem, fileTree.lastElementChild);

  showNotification(`Created ${fileName}`);
}

// Download File
function downloadFile() {
  const content = editor.getValue();
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = currentFile;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showNotification(`Downloaded ${currentFile}`);
}

// Vim Mode
function toggleVimMode() {
  if (!vimLoaded) {
    // Queue the user's click while the extension downloads and inform them
    pendingVimClicks++;
    showNotification('Vim extension is still loading. Your request will be applied when ready.');
    return;
  }

  isVimEnabled = !isVimEnabled;
  const toggle = document.getElementById("vimToggle");
  const vimStatus = document.getElementById("vimStatus");
  const checkbox = document.getElementById("vimModeToggle");

  if (isVimEnabled) {
    // Enable Vim mode
    const statusNode = document.getElementById("vimStatus");
    vimMode = MonacoVim.initVimMode(editor, statusNode);
    toggle.textContent = "Vim: ON";
    toggle.style.background = "#007acc";
    vimStatus.style.display = "inline";
    checkbox.checked = true;

    showNotification("Vim mode enabled");
  } else {
    // Disable Vim mode
    if (vimMode) {
      vimMode.dispose();
      vimMode = null;
    }
    toggle.textContent = "Vim: OFF";
    toggle.style.background = "rgba(255,255,255,0.1)";
    vimStatus.style.display = "none";
    checkbox.checked = false;

    showNotification("Vim mode disabled");
  }
}

// Settings
function openSettings() {
  document.getElementById("settingsModal").classList.add("active");
}

function changeFontSize(size) {
  editor.updateOptions({ fontSize: parseInt(size) });
  document.getElementById("fontSizeValue").textContent = size + "px";
}

function toggleWordWrap() {
  const checked = document.getElementById("wordWrapToggle").checked;
  editor.updateOptions({ wordWrap: checked ? "on" : "off" });
}

function toggleMinimap() {
  const checked = document.getElementById("minimapToggle").checked;
  editor.updateOptions({ minimap: { enabled: checked } });
}

function toggleLineNumbers() {
  const checked = document.getElementById("lineNumbersToggle").checked;
  editor.updateOptions({ lineNumbers: checked ? "on" : "off" });
}

function toggleAutoSave() {
  const checked = document.getElementById("autoSaveToggle").checked;
  if (checked) {
    autoSaveInterval = setInterval(() => {
      const content = editor.getValue();
      openFiles[currentFile] = content;
      console.log("Auto-saved", currentFile);
    }, 3000);
    showNotification("Auto-save enabled (3s interval)");
  } else {
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval);
      autoSaveInterval = null;
    }
    showNotification("Auto-save disabled");
  }
}

// Theme Management
function changeTheme() {
  currentTheme = (currentTheme + 1) % themes.length;
  monaco.editor.setTheme(themes[currentTheme]);

  const themeNames = {
    "vs-dark": "Dark",
    vs: "Light",
    "hc-black": "High Contrast",
  };
  showNotification(`Theme: ${themeNames[themes[currentTheme]]}`);
}

// Command Palette
function toggleCommandPalette() {
  const palette = document.getElementById("commandPalette");
  const isActive = palette.classList.contains("active");

  if (isActive) {
    palette.classList.remove("active");
    document.getElementById("commandInput").value = "";
    document.querySelectorAll("#commandList .command-item").forEach((item) => {
      item.style.display = "flex";
    });
  } else {
    palette.classList.add("active");
    document.getElementById("commandInput").focus();
  }
}

// Command palette search
document.getElementById("commandInput")?.addEventListener("input", (e) => {
  const search = e.target.value.toLowerCase();
  const items = document.querySelectorAll("#commandList .command-item");

  items.forEach((item) => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(search) ? "flex" : "none";
  });
});

// Command palette enter key
document.getElementById("commandInput")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const visibleItems = Array.from(
      document.querySelectorAll("#commandList .command-item")
    ).filter((item) => item.style.display !== "none");
    if (visibleItems.length > 0) {
      visibleItems[0].click();
      toggleCommandPalette();
    }
  }
});

// Explorer Toggle
function toggleExplorer() {
  const explorer = document.getElementById("explorer");
  explorer.classList.toggle("visible");
}

// Modal Management
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
}

// Notifications
function showNotification(message) {
  const notif = document.createElement("div");
  notif.className = "notification";
  notif.textContent = message;
  document.body.appendChild(notif);

  setTimeout(() => {
    notif.remove();
  }, 3000);
}

// Utility Functions
function showSearch() {
  editor.trigger("", "actions.find");
}

function formatDocument() {
  editor.getAction("editor.action.formatDocument").run();
  showNotification("Document formatted");
}

function showHelp() {
  alert(`Keyboard Shortcuts:
    
Ctrl+N - New File
Ctrl+S - Download File
Ctrl+, - Settings
Ctrl+Shift+P - Command Palette
Ctrl+Shift+E - Toggle Explorer
Ctrl+Shift+V - Toggle Vim Mode
Shift+Alt+F - Format Document
Ctrl+/ - Toggle Comment
Alt+↑/↓ - Move Line
Ctrl+D - Add Selection to Next Find Match
Ctrl+F - Find
Ctrl+H - Replace
F3/Shift+F3 - Find Next/Previous
Ctrl+L - Select Line
Ctrl+Shift+K - Delete Line`);
}

function openNewFile() {
  openNewFileDialog();
}

// Keyboard Shortcuts
document.addEventListener("keydown", (e) => {
  // Ctrl+Shift+P - Command Palette
  if (e.ctrlKey && e.shiftKey && e.key === "P") {
    e.preventDefault();
    toggleCommandPalette();
  }

  // Ctrl+N - New File
  if (e.ctrlKey && e.key === "n") {
    e.preventDefault();
    openNewFileDialog();
  }

  // Ctrl+S - Download File
  if (e.ctrlKey && e.key === "s") {
    e.preventDefault();
    downloadFile();
  }

  // Ctrl+, - Settings
  if (e.ctrlKey && e.key === ",") {
    e.preventDefault();
    openSettings();
  }

  // Ctrl+Shift+E - Toggle Explorer
  if (e.ctrlKey && e.shiftKey && e.key === "E") {
    e.preventDefault();
    toggleExplorer();
  }

  // Ctrl+Shift+V - Toggle Vim
  if (e.ctrlKey && e.shiftKey && e.key === "V") {
    e.preventDefault();
    toggleVimMode();
  }

  // Escape - Close modals and command palette
  if (e.key === "Escape") {
    document
      .querySelectorAll(".modal")
      .forEach((m) => m.classList.remove("active"));
    document.getElementById("commandPalette").classList.remove("active");
  }
});

// Click outside to close command palette
document.addEventListener("click", (e) => {
  const palette = document.getElementById("commandPalette");
  if (palette.classList.contains("active") && !palette.contains(e.target)) {
    palette.classList.remove("active");
  }
});

// Prevent command palette from closing when clicking inside
document.getElementById("commandPalette")?.addEventListener("click", (e) => {
  e.stopPropagation();
});

// Enter key in new file modal
document.getElementById("newFileName")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    createNewFile();
  }
});
