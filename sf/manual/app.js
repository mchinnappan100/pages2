let steps = [];
let currentStepIndex = -1;
let monacoEditor = null;

// === Splitter Resizer ===
let isResizing = false;
const leftPane = document.getElementById("leftPane");
const resizer = document.getElementById("resizer");

resizer.addEventListener("mousedown", () => {
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

// === Initialize Monaco Editor ===
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
    fontFamily: 'SF Mono, Menlo, Monaco, Consolas, "Courier New", monospace',
  });

monacoEditor.getDomNode().addEventListener('paste', async (e) => {
  if (!e.clipboardData || !e.clipboardData.items) return;

  const items = Array.from(e.clipboardData.items);
  const imageItems = items.filter(item => item.kind === 'file' && item.type.startsWith('image/'));
  if (!imageItems.length) return;

  e.preventDefault();
  e.stopPropagation();

  const model = monacoEditor.getModel();
  const position = monacoEditor.getPosition();

  for (const item of imageItems) {
    const blob = item.getAsFile();
    if (!blob) continue;

    // Optional resize
    const finalBlob = blob.size > 5_000_000 ? await resizeImageBlob(blob, 1400, 0.9) : blob;

    const reader = new FileReader();
    reader.onload = () => {
      const markdown = `![Screenshot](${reader.result})\n`;
      model.applyEdits([{
        range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
        text: markdown,
        forceMoveMarkers: true
      }]);

      // Move cursor after inserted image
      monacoEditor.setPosition({
        lineNumber: position.lineNumber + markdown.split('\n').length - 1,
        column: 1
      });
      monacoEditor.revealPositionInCenter(monacoEditor.getPosition());
    };
    reader.readAsDataURL(finalBlob);
  }
});

// Resize helper (optional but recommended)
function resizeImageBlob(blob, maxWidth = 1400, quality = 0.9) {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      if (img.width <= maxWidth) {
        resolve(blob);
        return;
      }
      const ratio = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * ratio;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(resolve, blob.type || 'image/jpeg', quality);
    };
    img.onerror = () => resolve(blob);
    img.src = URL.createObjectURL(blob);
  });
};

  // Auto-save on change
  monacoEditor.onDidChangeModelContent(() => {
    if (currentStepIndex >= 0) {
      steps[currentStepIndex].Description = monacoEditor.getValue();
    }
  });

  // Auto-format Step X and ====== on input
  monacoEditor.onDidChangeModelContent(() => {
    const value = monacoEditor.getValue();
    let newValue = value
      .replace(/^(Step\s*\d+[:.\-\–\—]?\s*.+)$/gm, match => `**${match.trim()}**`)
      .replace(/^[=]{6,}$/gm, '---');

    if (newValue !== value) {
      const fullRange = monacoEditor.getModel().getFullModelRange();
      monacoEditor.executeEdits('auto-format', [{
        range: fullRange,
        text: newValue,
        forceMoveMarkers: true
      }]);
    }
  });
});

// Helper: Resize large images to prevent lag
function resizeImageBlob(blob, maxWidth = 1200, quality = 0.92) {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      if (img.width <= maxWidth) {
        resolve(blob);
        return;
      }
      const ratio = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * ratio;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(resolve, blob.type, quality);
    };
    img.onerror = () => resolve(blob);
    img.src = URL.createObjectURL(blob);
  });
}

// === CSV Import ===
document.getElementById("csvUpload").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    complete: (result) => {
      const headers = result.data[0] || [];
      steps = [];
      for (let i = 1; i < result.data.length; i++) {
        const row = result.data[i];
        if (!row || row.length < 2) continue;
        const step = {};
        headers.forEach((h, idx) => {
          step[h.trim()] = (row[idx] || '').toString();
        });
        steps.push(step);
      }
      renderSteps();
      alert(`Imported ${steps.length} steps successfully!`);
    },
    skipEmptyLines: true,
    error: (err) => alert("CSV parse error: " + err)
  });
});

// === Render Steps List ===
function renderSteps() {
  const list = document.getElementById("stepsList");
  list.innerHTML = "";
  steps.forEach((step, i) => {
    const div = document.createElement("div");
    div.className = `step-item p-4 mb-3 bg-gray-700 rounded-lg cursor-pointer transition hover:bg-gray-600 ${currentStepIndex === i ? 'active ring-2 ring-blue-500' : ''}`;
    
    const preview = (step.Description || "")
      .replace(/\*\*(Step\s*\d+[:.\-\–\—]?.*?)\*\*/g, '$1')
      .replace(/---/g, '======')
      .split('\n')
      .slice(0, 4)
      .join(' ')
      .substring(0, 180) + (step.Description?.length > 180 ? '...' : '');

    div.innerHTML = `
      <div class="font-bold text-blue-400">Step ${step.Step || i + 1}</div>
      <div class="text-sm text-gray-300 mt-2 leading-relaxed">${preview || '<em class="text-gray-500">No description</em>'}</div>
    `;
    div.onclick = () => selectStep(i);
    list.appendChild(div);
  });
}

// === Select Step ===
function selectStep(index) {
  currentStepIndex = index;
  const step = steps[index];

  document.querySelectorAll(".step-item").forEach((el, i) => {
    el.classList.toggle("active", i === index);
  });

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

// === Save Current Step ===
function saveCurrentStep() {
  if (currentStepIndex === -1) return;

  steps[currentStepIndex] = {
    Step: document.getElementById("stepNumber").value.trim(),
    Description: monacoEditor ? monacoEditor.getValue() : "",
    Object: document.getElementById("objectField").value.trim(),
    Action: document.getElementById("actionField").value,
    Automated: document.getElementById("automatedField").value,
    Reason: "", // Add input if needed
    MetadataType: document.getElementById("metadataType").value.trim(),
    APIAction: document.getElementById("apiAction").value,
    Prompt: document.getElementById("promptField").value,
  };

  renderSteps();
}

// === Buttons ===
document.getElementById("saveStep").onclick = saveCurrentStep;

document.getElementById("addStep").onclick = () => {
  const newStep = {
    Step: (steps.length + 1).toString(),
    Description: `**Step ${steps.length + 1}:** \n\n`,
    Object: "",
    Action: "",
    Automated: "N/A",
    MetadataType: "",
    APIAction: "",
    Prompt: ""
  };
  steps.push(newStep);
  renderSteps();
  selectStep(steps.length - 1);
};

document.getElementById("deleteStep").onclick = () => {
  if (currentStepIndex === -1 || !confirm("Delete this step permanently?")) return;
  steps.splice(currentStepIndex, 1);
  currentStepIndex = -1;
  document.getElementById("editorContainer").classList.add("hidden");
  document.getElementById("emptyState").classList.remove("hidden");
  renderSteps();
};

// === Generate Prompt ===
document.getElementById("generatePrompt").onclick = () => {
  const desc = monacoEditor?.getValue() || "";
  const obj = document.getElementById("objectField").value;
  const action = document.getElementById("actionField").value;

  const prompt = `You are a Salesforce Metadata API expert.
Task: Analyze this manual step:
"${action} ${obj ? obj + " - " : ""}${desc.split('\n')[0]}"

Determine if it can be automated and suggest metadata type + API action.

Respond in JSON only.`;
  
  document.getElementById("promptField").value = prompt;
};

// === Download CSV ===
document.getElementById("downloadCsv").onclick = () => {
  if (steps.length === 0) return alert("No steps to export!");

  const headers = ["Step","Description","Object","Action","Automated","Reason","MetadataType","APIAction","Prompt"];
  const rows = steps.map(s => headers.map(h => s[h] || ""));
  const csv = Papa.unparse([headers, ...rows]);

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `salesforce-manual-steps-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// === Prompt Modal ===
document.getElementById("viewPromptModal").onclick = () => {
  document.getElementById("promptContent").textContent = document.getElementById("promptField").value;
  document.getElementById("promptModal").classList.remove("hidden");
};
document.getElementById("closeModal").onclick = () => {
  document.getElementById("promptModal").classList.add("hidden");
};
document.getElementById("copyPrompt").onclick = () => {
  navigator.clipboard.writeText(document.getElementById("promptContent").textContent);
  const btn = document.getElementById("copyPrompt");
  btn.innerHTML = "Copied!";
  setTimeout(() => btn.innerHTML = '<i class="fas fa-copy"></i> Copy to Clipboard', 2000);
};