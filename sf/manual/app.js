// app.js

let steps = [];
let currentStepIndex = -1;
let isResizing = false;
let leftPane = document.getElementById("leftPane");
let rightPane = document.getElementById("rightPane");

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
  const minWidth = 250;
  const maxWidth = containerRect.width - 300;

  if (newLeftWidth >= minWidth && newLeftWidth <= maxWidth) {
    leftPane.style.flex = `0 0 ${newLeftWidth}px`;
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
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      parseCSV(event.target.result);
    };
    reader.readAsText(file);
  }
});

function parseCSV(csv) {
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
