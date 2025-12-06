let steps = [];
let currentStepIndex = -1;
let monacoEditor = null;
let searchTerm = '';
let previewVisible = false;
let kpiVisible = true;

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

  // Image Paste Handler
  const editorDomNode = monacoEditor.getDomNode();
  const textareaElements = editorDomNode.querySelectorAll('textarea');
  
  textareaElements.forEach(textarea => {
    textarea.addEventListener('paste', handleImagePaste, true);
  });
  
  editorDomNode.addEventListener('paste', handleImagePaste, true);

  async function handleImagePaste(e) {
    const clipboardData = e.clipboardData || window.clipboardData;
    if (!clipboardData) return;

    const items = Array.from(clipboardData.items || []);
    const imageItems = items.filter(item => item.kind === 'file' && item.type.startsWith('image/'));
    
    if (imageItems.length === 0) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    for (const item of imageItems) {
      const file = item.getAsFile();
      if (!file) continue;

      const finalBlob = file.size > 5_000_000 ? await resizeImageBlob(file, 1400, 0.9) : file;
      const base64 = await blobToBase64(finalBlob);
      insertImageIntoMonaco(base64);
    }

    return false;
  }

  function insertImageIntoMonaco(base64Data) {
    const model = monacoEditor.getModel();
    if (!model) return;

    const position = monacoEditor.getPosition() || { lineNumber: 1, column: 1 };
    const timestamp = new Date().toLocaleTimeString();
    const markdown = `\n![Image ${timestamp}](${base64Data})\n\n`;
    
    const range = new monaco.Range(
      position.lineNumber,
      position.column,
      position.lineNumber,
      position.column
    );

    model.pushEditOperations(
      [],
      [{
        range: range,
        text: markdown,
        forceMoveMarkers: true
      }],
      () => null
    );

    const lines = markdown.split('\n').length;
    monacoEditor.setPosition({
      lineNumber: position.lineNumber + lines - 1,
      column: 1
    });
    
    monacoEditor.revealPositionInCenter(monacoEditor.getPosition());
    monacoEditor.focus();

    if (currentStepIndex >= 0) {
      steps[currentStepIndex].Description = monacoEditor.getValue();
    }
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Auto-save on change
  let saveTimeout = null;
  monacoEditor.onDidChangeModelContent(() => {
    if (currentStepIndex >= 0) {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        steps[currentStepIndex].Description = monacoEditor.getValue();
        updateMarkdownPreview();
      }, 300);
    }
  });

  // Auto-format Step X and ====== on input (debounced)
  let isFormatting = false;
  let formatTimeout = null;
  monacoEditor.onDidChangeModelContent(() => {
    if (isFormatting) return;
    
    clearTimeout(formatTimeout);
    formatTimeout = setTimeout(() => {
      try {
        const model = monacoEditor.getModel();
        if (!model) return;
        
        const value = model.getValue();
        if (!value) return;
        
        let newValue = value
          .replace(/^(Step\s*\d+[:.\-\–\—]?\s*.+)$/gm, match => {
            const trimmed = match.trim();
            if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
              return match;
            }
            return `**${trimmed}**`;
          })
          .replace(/^[=]{6,}$/gm, '---');

        if (newValue !== value) {
          isFormatting = true;
          const position = monacoEditor.getPosition();
          const selections = monacoEditor.getSelections();
          
          model.pushEditOperations(
            selections,
            [{
              range: model.getFullModelRange(),
              text: newValue
            }],
            () => selections
          );
          
          if (position) {
            monacoEditor.setPosition(position);
          }
          
          isFormatting = false;
        }
      } catch (err) {
        console.error('Auto-format error:', err);
        isFormatting = false;
      }
    }, 500);
  });
});

// Helper: Resize large images to prevent lag
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
      canvas.toBlob((resizedBlob) => {
        resolve(resizedBlob || blob);
      }, blob.type || 'image/jpeg', quality);
    };
    img.onerror = () => resolve(blob);
    img.src = URL.createObjectURL(blob);
  });
}

// === Image Upload Button (Fallback) ===
document.getElementById("insertImageBtn").addEventListener("change", async (e) => {
  const files = Array.from(e.target.files || []);
  if (files.length === 0 || !monacoEditor) return;

  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;

    const finalBlob = file.size > 5_000_000 ? await resizeImageBlob(file, 1400, 0.9) : file;
    const reader = new FileReader();
    
    reader.onload = () => {
      const base64Data = reader.result;
      const model = monacoEditor.getModel();
      if (!model) return;

      const position = monacoEditor.getPosition() || { lineNumber: 1, column: 1 };
      const markdown = `\n![${file.name}](${base64Data})\n\n`;
      
      model.pushEditOperations(
        [],
        [{
          range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
          text: markdown,
          forceMoveMarkers: true
        }],
        () => null
      );

      const lines = markdown.split('\n').length;
      monacoEditor.setPosition({
        lineNumber: position.lineNumber + lines - 1,
        column: 1
      });
      
      monacoEditor.focus();
      
      if (currentStepIndex >= 0) {
        steps[currentStepIndex].Description = monacoEditor.getValue();
      }
    };
    
    reader.readAsDataURL(finalBlob);
  }

  e.target.value = '';
});

// === Search Steps ===
document.getElementById("searchSteps").addEventListener("input", (e) => {
  searchTerm = e.target.value.toLowerCase().trim();
  renderSteps();
});

// === Toggle KPI Dashboard ===
document.getElementById("toggleKPI").addEventListener("click", () => {
  kpiVisible = !kpiVisible;
  const kpiSection = document.getElementById("kpiSection");
  const splitContainer = document.querySelector(".split-container");
  const button = document.getElementById("toggleKPI");
  
  if (kpiVisible) {
    kpiSection.style.display = "grid";
    splitContainer.classList.remove("kpi-hidden");
    button.innerHTML = '<i class="fas fa-chart-bar mr-2"></i>Hide KPIs';
  } else {
    kpiSection.style.display = "none";
    splitContainer.classList.add("kpi-hidden");
    button.innerHTML = '<i class="fas fa-chart-bar mr-2"></i>Show KPIs';
  }
});

// === Markdown Preview Toggle ===
document.getElementById("togglePreview").addEventListener("click", () => {
  previewVisible = !previewVisible;
  const preview = document.getElementById("markdownPreview");
  const container = document.getElementById("editorPreviewContainer");
  const button = document.getElementById("togglePreview");
  
  if (previewVisible) {
    preview.style.display = "block";
    container.classList.remove("grid-cols-1");
    container.classList.add("grid-cols-2");
    button.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Preview';
    updateMarkdownPreview();
  } else {
    preview.style.display = "none";
    container.classList.remove("grid-cols-2");
    container.classList.add("grid-cols-1");
    button.innerHTML = '<i class="fas fa-eye"></i> Show Preview';
  }
});

function updateMarkdownPreview() {
  if (!previewVisible || !monacoEditor) return;
  
  const markdown = monacoEditor.getValue();
  const preview = document.getElementById("markdownPreview");
  
  marked.setOptions({
    breaks: true,
    gfm: true
  });
  
  preview.innerHTML = marked.parse(markdown);
  
  const editorLine = monacoEditor.getPosition()?.lineNumber || 0;
  const totalLines = monacoEditor.getModel()?.getLineCount() || 1;
  const scrollPercent = editorLine / totalLines;
  preview.scrollTop = preview.scrollHeight * scrollPercent;
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
      updateKPIs();
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
  
  const filteredSteps = steps.map((step, index) => ({ step, index }))
    .filter(({ step }) => {
      if (!searchTerm) return true;
      
      const searchableText = [
        step.Step || '',
        step.Description || '',
        step.Object || '',
        step.Action || '',
        step.MetadataType || ''
      ].join(' ').toLowerCase();
      
      return searchableText.includes(searchTerm);
    });

  if (filteredSteps.length === 0) {
    list.innerHTML = '<div class="text-gray-500 text-center p-4">No steps found</div>';
    return;
  }

  filteredSteps.forEach(({ step, index }) => {
    const div = document.createElement("div");
    div.className = `step-item p-4 mb-3 bg-gray-700 rounded-lg cursor-pointer transition hover:bg-gray-600 ${currentStepIndex === index ? 'active ring-2 ring-blue-500' : ''}`;
    
    // Use marked to parse markdown and strip HTML for preview
    let preview = step.Description || "";
    if (preview) {
      const html = marked.parse(preview, { breaks: true, gfm: true });
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      preview = tempDiv.textContent || tempDiv.innerText || '';
      preview = preview.replace(/!\[.*?\]\(.*?\)/g, '[Image]');
      preview = preview.substring(0, 180);
      if ((step.Description || '').length > 180) {
        preview += '...';
      }
    }

    // Highlight search term
    if (searchTerm && preview) {
      const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedTerm})`, 'gi');
      preview = preview.replace(regex, '<mark class="bg-yellow-500 text-black">$1</mark>');
    }

    div.innerHTML = `
      <div class="font-bold text-blue-400">Step ${step.Step || index + 1}</div>
      <div class="text-sm text-gray-300 mt-2 leading-relaxed">${preview || '<em class="text-gray-500">No description</em>'}</div>
    `;
    div.onclick = () => selectStep(index);
    list.appendChild(div);
  });

  updateKPIs();
}

// === Update KPI Dashboard ===
function updateKPIs() {
  const totalSteps = steps.length;
  const automatedSteps = steps.filter(s => s.Automated === 'true').length;
  // Manual is everything that's NOT automated (including N/A)
  const manualSteps = totalSteps - automatedSteps;
  const automationRate = totalSteps > 0 ? Math.round((automatedSteps / totalSteps) * 100) : 0;

  document.getElementById('kpiTotalSteps').textContent = totalSteps;
  document.getElementById('kpiAutomated').textContent = automatedSteps;
  document.getElementById('kpiManual').textContent = manualSteps;
  document.getElementById('kpiAutomationRate').textContent = automationRate + '%';
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
    updateMarkdownPreview();
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
    Reason: "",
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
  updateKPIs();
  selectStep(steps.length - 1);
};

document.getElementById("deleteStep").onclick = () => {
  if (currentStepIndex === -1 || !confirm("Delete this step permanently?")) return;
  steps.splice(currentStepIndex, 1);
  currentStepIndex = -1;
  document.getElementById("editorContainer").classList.add("hidden");
  document.getElementById("emptyState").classList.remove("hidden");
  renderSteps();
  updateKPIs();
};

// === Generate Prompt ===
document.getElementById("generatePrompt").onclick = () => {
  const desc = monacoEditor?.getValue() || "";
  const obj = document.getElementById("objectField").value;
  const action = document.getElementById("actionField").value;
  const stepNum = document.getElementById("stepNumber").value;
  const metadataType = document.getElementById("metadataType").value;
  const apiAction = document.getElementById("apiAction").value;
  const automated = document.getElementById("automatedField").value;

  const prompt = `You are a Salesforce Metadata API expert.

Task: Analyze this manual step and determine if it can be automated.

Step Details:
- Step Number: ${stepNum}
- Object: ${obj || 'N/A'}
- Action: ${action || 'N/A'}
- Currently Automated: ${automated}
- Metadata Type: ${metadataType || 'N/A'}
- API Action: ${apiAction || 'N/A'}

Description:
${desc}

Please analyze this step and provide:
1. Can this be automated? (true/false)
2. Suggested Metadata Type (if applicable)
3. Suggested API Action (create/update/delete/deploy)
4. Reasoning for your recommendation

Respond in JSON format with keys: canAutomate, metadataType, apiAction, reasoning`;
  
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