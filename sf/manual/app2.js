let steps = [];
let currentStepIndex = -1;
let monacoEditor = null;

// Splitter
let isResizing = false;
const leftPane = document.getElementById("leftPane");
const resizer = document.getElementById("resizer");

resizer.addEventListener("mousedown", (e) => {
  isResizing = true;
  document.body.style.cursor = "col-resize";
});
document.addEventListener("mousemove", (e) => {
  if (!isResizing) return;
  const container = document.querySelector(".split-container");
  const rect = container.getBoundingClientRect();
  const percent = ((e.clientX - rect.left) / rect.width) * 100;
  if (percent >= 20 && percent <= 70) {
    leftPane.style.flex = `0 0 ${percent}%`;
  }
});
document.addEventListener("mouseup", () => {
  isResizing = false;
  document.body.style.cursor = "default";
});

// Initialize Monaco Editor
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.51.0/min/vs' }});
require(['vs/editor/editor.main'], function () {
  monacoEditor = monaco.editor.create(document.getElementById('monacoContainer'), {
    value: '',
    language: 'markdown',
    theme: 'vs-dark',
    automaticLayout: true,
    fontSize: 15,
    wordWrap: 'on',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    lineNumbers: 'off',
    padding: { top: 20, bottom: 20 },
    renderWhitespace: 'boundary',
  });

  // Paste Images
  monacoEditor.onDidPaste(() => {
    setTimeout(() => {
      navigator.clipboard.read().then(items => {
        for (const item of items) {
          for (const type of item.types) {
            if (type.startsWith('image/')) {
              item.getType(type).then(blob => {
                const reader = new FileReader();
                reader.onload = () => {
                  const markdownImg = `\n![Pasted Image](${reader.result})\n`;
                  monacoEditor.trigger('keyboard', 'type', { text: markdownImg });
                };
                reader.readAsDataURL(blob);
              });
            }
          }
        }
      }).catch(() => {});
    }, 100);
  });

  monacoEditor.onDidChangeModelContent(() => {
    if (currentStepIndex >= 0) {
      steps[currentStepIndex].Description = monacoEditor.getValue();
    }
  });
});

// CSV Upload
document.getElementById("csvUpload").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  Papa.parse(file, {
    complete: (result) => {
      const headers = result.data[0];
      steps = [];
      for (let i = 1; i < result.data.length; i++) {
        const row = result.data[i];
        if (row.length < 2) continue;
        const step = {};
        headers.forEach((h, idx) => step[h.trim()] = (row[idx] || '').toString());
        steps.push(step);
      }
      renderSteps();
    },
    skipEmptyLines: true
  });
});

// Render Steps List
function renderSteps() {
  const list = document.getElementById("stepsList");
  list.innerHTML = "";
  steps.forEach((step, i) => {
    const div = document.createElement("div");
    div.className = `step-item p-4 mb-3 bg-gray-700 rounded-lg cursor-pointer ${currentStepIndex === i ? 'active' : ''}`;
    div.innerHTML = `
      <div class="font-bold text-blue-400">Step ${step.Step || i + 1}</div>
      <div class="text-sm text-gray-300 mt-1 line-clamp-3">
        ${step.Description?.replace(/\n/g, '<br>') || '<em>No description</em>'}
      </div>
    `;
    div.onclick = () => selectStep(i);
    list.appendChild(div);
  });
}

function selectStep(index) {
  currentStepIndex = index;
  const step = steps[index];
  document.querySelectorAll(".step-item").forEach((el, i) => el.classList.toggle("active", i === index));
  document.getElementById("editorContainer").classList.remove("hidden");
  document.getElementById("emptyState").classList.add("hidden");

  document.getElementById("stepNumber").value = step.Step || "";
  document.getElementById("objectField").value = step.Object || "";
  document.getElementById("actionField").value = step.Action || "";
  document.getElementById("automatedField").value = step.Automated || "N/A";
  document.getElementById("metadataType").value = step.MetadataType || "";
  document.getElementById("apiAction").value = step.APIAction || "";
  document.getElementById("promptField").value = step.Prompt || "";

  if (monacoEditor) {
    monacoEditor.setValue(step.Description || "");
  }
}

function saveCurrentStep() {
  if (currentStepIndex === -1) return;
  steps[currentStepIndex] = {
    Step: document.getElementById("stepNumber").value,
    Description: monacoEditor ? monacoEditor.getValue() : "",
    Object: document.getElementById("objectField").value,
    Action: document.getElementById("actionField").value,
    Automated: document.getElementById("automatedField").value,
    Reason: document.getElementById("reasonField")?.value || "",
    MetadataType: document.getElementById("metadataType").value,
    APIAction: document.getElementById("apiAction").value,
    Prompt: document.getElementById("promptField").value,
  };
  renderSteps();
}

// Buttons
document.getElementById("saveStep").onclick = saveCurrentStep;
document.getElementById("addStep").onclick = () => {
  steps.push({ Step: (steps.length + 1).toString(), Description: "", Automated: "N/A" });
  renderSteps();
  selectStep(steps.length - 1);
};
document.getElementById("deleteStep").onclick = () => {
  if (confirm("Delete this step?")) {
    steps.splice(currentStepIndex, 1);
    currentStepIndex = -1;
    document.getElementById("editorContainer").classList.add("hidden");
    document.getElementById("emptyState").classList.remove("hidden");
    renderSteps();
  }
};

// Generate Prompt
document.getElementById("generatePrompt").onclick = () => {
  const desc = monacoEditor?.getValue() || "";
  const obj = document.getElementById("objectField").value;
  const action = document.getElementById("actionField").value;
  const prompt = `You are a Salesforce expert...\n[Your full prompt here]`;
  document.getElementById("promptField").value = prompt;
};

// Download CSV
document.getElementById("downloadCsv").onclick = () => {
  if (!steps.length) return alert("No steps!");
  const headers = ["Step","Description","Object","Action","Automated","Reason","MetadataType","APIAction","Prompt"];
  const rows = steps.map(s => headers.map(h => s[h] || ""));
  const csv = Papa.unparse([headers, ...rows]);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `salesforce-steps-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
};

// Modal
document.getElementById("viewPromptModal").onclick = () => {
  document.getElementById("promptContent").textContent = document.getElementById("promptField").value;
  document.getElementById("promptModal").classList.remove("hidden");
};
document.getElementById("closeModal").onclick = () => document.getElementById("promptModal").classList.add("hidden");
document.getElementById("copyPrompt").onclick = () => {
  navigator.clipboard.writeText(document.getElementById("promptContent").textContent);
  const btn = document.getElementById("copyPrompt");
  btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
  setTimeout(() => btn.innerHTML = '<i class="fas fa-copy"></i> Copy to Clipboard', 2000);
};