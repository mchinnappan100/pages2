let steps = [];
let currentStepIndex = -1;
let isResizing = false;
let leftPane = document.getElementById("leftPane");
let rightPane = document.getElementById("rightPane");

// Load saved splitter position from memory (not localStorage)
let splitterPosition = 30; // Default 30%

// Apply saved splitter position on load
function applySplitterPosition() {
  leftPane.style.flex = `0 0 ${splitterPosition}%`;
  rightPane.style.flex = "1";
}

applySplitterPosition();

// Resizer functionality
const resizer = document.getElementById("resizer");
resizer.addEventListener("mousedown", (e) => {
  isResizing = true;
  document.body.style.cursor = "col-resize";
});

document.addEventListener("mousemove", (e) => {
  if (!isResizing) return;
  const container = document.querySelector(".split-container");
  const containerRect = container.getBoundingClientRect();
  const newLeftWidth = e.clientX - containerRect.left;
  const newLeftPercent = (newLeftWidth / containerRect.width) * 100;
  const minPercent = 20;
  const maxPercent = 70;

  if (newLeftPercent >= minPercent && newLeftPercent <= maxPercent) {
    splitterPosition = newLeftPercent;
    leftPane.style.flex = `0 0 ${newLeftPercent}%`;
    rightPane.style.flex = "1";
  }
});

document.addEventListener("mouseup", () => {
  isResizing = false;
  document.body.style.cursor = "default";
});

// Rich text editor - handle paste with images
const descriptionEditor = document.getElementById("descriptionEditor");
descriptionEditor.addEventListener("paste", (e) => {
  const items = e.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf("image") !== -1) {
      e.preventDefault();
      const blob = items[i].getAsFile();
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.createElement("img");
        img.src = event.target.result;
        img.style.maxWidth = "100%";
        document.execCommand("insertHTML", false, img.outerHTML);
      };
      reader.readAsDataURL(blob);
    }
  }
});

// CSV Upload

document.getElementById("csvUpload").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    complete: function(results) {
      // Reuse the same logic
      const headers = results.data[0];
      steps = [];

      for (let i = 1; i < results.data.length; i++) {
        const row = results.data[i];
        if (!row || row.length === 1 && !row[0]) continue;

        const step = {};
        headers.forEach((header, idx) => {
          step[header.trim()] = (row[idx] || "").toString();
        });
        steps.push(step);
      }

      renderSteps();
      alert(`Imported ${steps.length} steps successfully!`);
    },
    error: function(err) {
      alert("Failed to parse CSV: " + err);
    },
    skipEmptyLines: true,
  });
});
function parseCSV(csvText) {
  Papa.parse(csvText, {
    complete: function(results) {
      if (results.errors.length) {
        console.warn("CSV Parse Errors:", results.errors);
        alert("CSV had parsing issues. Check console.");
      }

      const headers = results.data[0];
      steps = [];

      for (let i = 1; i < results.data.length; i++) {
        const row = results.data[i];
        if (row.length === 1 && !row[0]) continue; // skip empty lines

        const step = {};
        headers.forEach((header, index) => {
          let value = row[index] || "";
          // PapaParse already unescapes "" → " for us!
          step[header.trim()] = value;
        });
        steps.push(step);
      }

      renderSteps();
      console.log("CSV imported successfully:", steps.length, "steps");
    },
    skipEmptyLines: true,
    // Important: handles multiline, quotes, etc. automatically
  });
}

function parseCSV2(csv) {
  const lines = csv.split("\n");
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  steps = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = parseCSVLine(lines[i]);
      const step = {};
      headers.forEach((header, index) => {
        step[header] = values[index] || "";
      });
      steps.push(step);
    }
  }
  renderSteps();
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
function renderSteps2() {
  const stepsList = document.getElementById("stepsList");
  stepsList.innerHTML = "";

  steps.forEach((step, index) => {
    const stepDiv = document.createElement("div");
    stepDiv.className = "step-item p-4 mb-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition";
    
    // This is the key change:
    const previewHtml = (step.Description || "")
      .replace(/======+/g, "<br>================================<br>")  // force line before/after
      .replace(/\n/g, "<br>")                                          // respect actual newlines
      .replace(/<br><br>/g, "<br><br>")                                 // keep spacing
      .trim();

    stepDiv.innerHTML = `
      <div class="font-bold text-blue-400 mb-1">Step ${step.Step || index + 1}</div>
      <div class="text-sm text-gray-300 leading-relaxed preview-text">
        ${previewHtml || "<span class='text-gray-500'>No description</span>"}
      </div>
    `;

    stepDiv.addEventListener("click", () => selectStep(index));
    stepsList.appendChild(stepDiv);
  });

  // Re-apply active state if needed
  if (currentStepIndex >= 0) {
    document.querySelectorAll(".step-item")[currentStepIndex]?.classList.add("ring-2", "ring-blue-500");
  }
}
function renderSteps() {
  const stepsList = document.getElementById("stepsList");
  stepsList.innerHTML = "";

  steps.forEach((step, index) => {
    const stepDiv = document.createElement("div");
    stepDiv.className = "step-item p-3 mb-2 bg-gray-700 rounded-lg";
    stepDiv.innerHTML = `
                    <div class="font-semibold">Step ${
                      step.Step || index + 1
                    }</div>
                    <div class="text-sm text-gray-400">${truncateText(
                      stripHTML(step.Description),
                      50
                    )}</div>
                `;
    stepDiv.addEventListener("click", () => selectStep(index));
    stepsList.appendChild(stepDiv);
  });
}

function selectStep(index) {
  currentStepIndex = index;
  const step = steps[index];

  // Update active state
  document.querySelectorAll(".step-item").forEach((item, i) => {
    item.classList.toggle("active", i === index);
  });

  // Show editor
  document.getElementById("editorContainer").classList.remove("hidden");
  document.getElementById("emptyState").classList.add("hidden");

  // Populate fields
  document.getElementById("stepNumber").value = step.Step || "";
  descriptionEditor.innerHTML = step.Description || "";
  document.getElementById("objectField").value = step.Object || "";
  document.getElementById("actionField").value = step.Action || "";
  document.getElementById("automatedField").value = step.Automated || "N/A";
  document.getElementById("reasonField").value = step.Reason || "";
  document.getElementById("metadataType").value = step.MetadataType || "";
  document.getElementById("apiAction").value = step.APIAction || "";
  document.getElementById("promptField").value = step.Prompt || "";
}

function saveCurrentStep() {
  if (currentStepIndex === -1) return;

  steps[currentStepIndex] = {
    Step: document.getElementById("stepNumber").value,
    Description: descriptionEditor.innerHTML,
    Object: document.getElementById("objectField").value,
    Action: document.getElementById("actionField").value,
    Automated: document.getElementById("automatedField").value,
    Reason: document.getElementById("reasonField").value,
    MetadataType: document.getElementById("metadataType").value,
    APIAction: document.getElementById("apiAction").value,
    Prompt: document.getElementById("promptField").value,
  };

  renderSteps();
  selectStep(currentStepIndex);
}

document.getElementById("saveStep").addEventListener("click", saveCurrentStep);

document.getElementById("deleteStep").addEventListener("click", () => {
  if (currentStepIndex === -1) return;
  if (confirm("Are you sure you want to delete this step?")) {
    steps.splice(currentStepIndex, 1);
    currentStepIndex = -1;
    document.getElementById("editorContainer").classList.add("hidden");
    document.getElementById("emptyState").classList.remove("hidden");
    renderSteps();
  }
});

document.getElementById("addStep").addEventListener("click", () => {
  const newStep = {
    Step: (steps.length + 1).toString(),
    Description: "",
    Object: "",
    Action: "",
    Automated: "N/A",
    Reason: "",
    MetadataType: "",
    APIAction: "",
    Prompt: "",
  };
  steps.push(newStep);
  renderSteps();
  selectStep(steps.length - 1);
});

// Generate Prompt
document.getElementById("generatePrompt").addEventListener("click", () => {
  const description = stripHTML(descriptionEditor.innerHTML);
  const object = document.getElementById("objectField").value;
  const action = document.getElementById("actionField").value;

  const prompt = `You are a Salesforce Metadata API expert.
Task: Analyze this manual org setup step:
"${action}: ${description}"
${object ? `Object: ${object}` : ""}

Determine:
1. Can it be automated using Salesforce Metadata API?
2. If yes: metadata type (e.g. CustomField, PageLayout) and action (create/update/delete).
3. Provide a clear, concise reason for your decision.

Respond **only** with valid JSON in this exact format:
{
  "automated": true|false,
  "reason": "short explanation (max 200 chars)",
  "metadata_type": "CustomObject|CustomField|ValidationRule|Flow|etc",
  "api_action": "create|update|delete|deploy"
}
If not automatable, set metadata_type and api_action to null.`;

  document.getElementById("promptField").value = prompt;
});

// View Prompt Modal
document.getElementById("viewPromptModal").addEventListener("click", () => {
  const prompt = document.getElementById("promptField").value;
  document.getElementById("promptContent").textContent = prompt;
  document.getElementById("promptModal").classList.remove("hidden");
});

document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("promptModal").classList.add("hidden");
});

document.getElementById("copyPrompt").addEventListener("click", () => {
  const prompt = document.getElementById("promptContent").textContent;
  navigator.clipboard.writeText(prompt).then(() => {
    const btn = document.getElementById("copyPrompt");
    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-copy"></i> Copy to Clipboard';
    }, 2000);
  });
});

// Download CSV
document.getElementById("downloadCsv").addEventListener("click", () => {
  if (steps.length === 0) {
    alert("No steps to download!");
    return;
  }

  const headers = [
    "Step",
    "Description",
    "Object",
    "Action",
    "Automated",
    "Reason",
    "MetadataType",
    "APIAction",
  ];
  let csv = headers.join(",") + "\n";

  steps.forEach((step) => {
    const row = headers.map((header) => {
      let value = step[header] || "";
      // Keep HTML intact for Description field to preserve images
      if (header === "Description") {
        // Keep the full HTML with images
        value = value;
      }
      value = value.replace(/"/g, '""');
      return `"${value}"`;
    });
    csv += row.join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `salesforce-steps-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

function stripHTML(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

function truncateText(text, length) {
  return text.length > length ? text.substring(0, length) + "..." : text;
}


descriptionEditor.addEventListener("input", () => {
  let html = descriptionEditor.innerHTML;

  // 1. Auto-format any "Step X" line → bold blue + blank line after
  const formatted = html
    .replace(
      /(^|<br>|\n|\r\n?)(Step\s*\d+[:.\-\–\—]?\s*[^<]*?)(?=<br>|<div|<p|<\/|$)/gi,
      '$1<strong style="color:#60a5fa; font-size:1.1em; display:block; margin:12px 0 8px 0;">$2</strong><br>'
    )
    // 2. Auto-convert ====== lines into nice dividers with spacing
    .replace(
      /(^|<br>)[=]{6,}/g,
      '$1<br><div style="border-top:2px solid #6b7280; margin:20px 0; opacity:0.6;"></div><br>'
    )
    // 3. Clean up any accidental triple <br><br><br>
    .replace(/<br><br><br>/g, "<br><br>");

  if (formatted !== html) {
    descriptionEditor.innerHTML = formatted;

    // Keep cursor at the end (feels natural)
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(descriptionEditor);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }
});

// Also run once when loading a step (so existing content gets formatted)
const originalSelectStep = selectStep;
selectStep = function(index) {
  originalSelectStep(index);
  // Trigger formatting after content is loaded
  setTimeout(() => {
    const event = new Event("input", { bubbles: true });
    descriptionEditor.dispatchEvent(event);
  }, 10);
};
