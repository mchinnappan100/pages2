// ────────────────────────────────────────────────
// State
// ────────────────────────────────────────────────
let state = {
  theme: localStorage.getItem("theme") || "dark",
  projects: JSON.parse(localStorage.getItem("coe_projects")) || [],
  currentProjectId: localStorage.getItem("coe_current_project") || null,
  assignees: JSON.parse(localStorage.getItem("coe_assignees")) || [],
  showProjectModal: false,
  showActivityModal: false,
  showSettingsModal: false,
  showConfirmModal: false,
  showMessageModal: false,
  confirmMessage: "",
  confirmCallback: null,
  messageTitle: "",
  messageContent: "",
  newAssignee: "",
  editingProject: null,
  editingActivity: null,
  projectForm: {
    title: "",
    description: "",
    createdDate: new Date().toISOString().split("T")[0],
  },
  activityForm: {
    title: "",
    category: "Governance",
    status: "Not Started",
    priority: "Medium",
    assignee: "",
    dueDate: "",
    description: "",
    completionDate: "",
    recurrence: "none",
  },
  activityFilter: "all",
  activitySort: "dueDate",
};

const categories = [
  "Governance",
  "Best Practices",
  "Training",
  "Innovation",
  "Support",
  "Compliance",
  "Architecture",
  "Security",
];
const statuses = [
  "Not Started",
  "In Progress",
  "Blocked",
  "Completed",
  "On Hold",
];
const priorities = ["Low", "Medium", "High", "Critical"];
const recurrenceOptions = [
  { value: "none", label: "No recurrence" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 15 days" },
  { value: "monthly", label: "Monthly" },
];

let draggedActivityId = null;

// ────────────────────────────────────────────────
// Dialog Helpers
// ────────────────────────────────────────────────
function showConfirm(message, callback) {
  state.confirmMessage = message;
  state.confirmCallback = callback;
  state.showConfirmModal = true;
  render();
}

function showMessage(title, content) {
  state.messageTitle = title;
  state.messageContent = content;
  state.showMessageModal = true;
  render();
}

function closeConfirm(result) {
  state.showConfirmModal = false;
  if (result && typeof state.confirmCallback === "function") {
    state.confirmCallback();
  }
  state.confirmCallback = null;
  render();
}

function closeMessage() {
  state.showMessageModal = false;
  render();
}

// ────────────────────────────────────────────────
// Persistence
// ────────────────────────────────────────────────
function saveState() {
  localStorage.setItem("coe_projects", JSON.stringify(state.projects));
  localStorage.setItem("coe_assignees", JSON.stringify(state.assignees));
  if (state.currentProjectId) {
    localStorage.setItem("coe_current_project", state.currentProjectId);
  } else {
    localStorage.removeItem("coe_current_project");
  }
}

function getCurrentProject() {
  return state.projects.find((p) => p.id === state.currentProjectId) || null;
}

function calculateKPIs(project = getCurrentProject()) {
  if (!project?.activities)
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      blocked: 0,
      completionRate: 0,
      overdue: 0,
    };
  const today = new Date().toISOString().split("T")[0];
  const acts = project.activities;
  const total = acts.length;
  const completed = acts.filter((a) => a.status === "Completed").length;
  const inProgress = acts.filter((a) => a.status === "In Progress").length;
  const blocked = acts.filter((a) => a.status === "Blocked").length;
  const overdue = acts.filter(
    (a) => a.dueDate && a.dueDate < today && a.status !== "Completed",
  ).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, inProgress, blocked, completionRate, overdue };
}

// ────────────────────────────────────────────────
// Recurrence Helpers
// ────────────────────────────────────────────────
function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function addMonths(dateStr, months) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
}

function generateNextDueDate(currentDue, recurrence) {
  if (recurrence === "none" || !currentDue) return null;
  switch (recurrence) {
    case "daily":
      return addDays(currentDue, 1);
    case "weekly":
      return addDays(currentDue, 7);
    case "biweekly":
      return addDays(currentDue, 15);
    case "monthly":
      return addMonths(currentDue, 1);
    default:
      return null;
  }
}

// ────────────────────────────────────────────────
// Assignee Management
// ────────────────────────────────────────────────
function addAssignee() {
  const name = state.newAssignee.trim();
  if (!name)
    return showMessage("Input required", "Please enter an assignee name.");
  if (state.assignees.includes(name))
    return showMessage("Duplicate", "This assignee is already in the list.");
  state.assignees.push(name);
  state.assignees.sort((a, b) => a.localeCompare(b));
  state.newAssignee = "";
  saveState();
  render();
}

function removeAssignee(name) {
  showConfirm(`Remove assignee "${name}" from the list?`, () => {
    state.assignees = state.assignees.filter((a) => a !== name);
    saveState();
    render();
  });
}

// ────────────────────────────────────────────────
// Drag & Drop
// ────────────────────────────────────────────────
function handleDragStart(e) {
  draggedActivityId = parseInt(e.currentTarget.dataset.activityId);
  e.currentTarget.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
}

function handleDragEnd(e) {
  e.currentTarget.classList.remove("dragging");
  document
    .querySelectorAll(".activity-item")
    .forEach((item) => item.classList.remove("drag-over"));
  draggedActivityId = null;
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

function handleDragEnter(e) {
  e.preventDefault();
  const item = e.currentTarget;
  if (parseInt(item.dataset.activityId) !== draggedActivityId)
    item.classList.add("drag-over");
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove("drag-over");
}

function handleDrop(e) {
  e.preventDefault();
  const dropTarget = e.currentTarget;
  const dropId = parseInt(dropTarget.dataset.activityId);
  if (dropId === draggedActivityId) return;

  const project = getCurrentProject();
  if (!project) return;

  const acts = project.activities;
  const dragIdx = acts.findIndex((a) => a.id === draggedActivityId);
  const dropIdx = acts.findIndex((a) => a.id === dropId);

  if (dragIdx === -1 || dropIdx === -1) return;

  const [moved] = acts.splice(dragIdx, 1);
  acts.splice(dropIdx, 0, moved);

  saveState();
  render();
}

// ────────────────────────────────────────────────
// Project CRUD
// ────────────────────────────────────────────────
function createOrUpdateProject(isUpdate = false) {
  const title = document.getElementById("projectTitle")?.value.trim();
  if (!title)
    return showMessage("Input required", "Project title is required.");

  const form = {
    title,
    description:
      document.getElementById("projectDescription")?.value.trim() || "",
    createdDate: new Date().toISOString().split("T")[0],
  };

  if (isUpdate && state.editingProject) {
    const idx = state.projects.findIndex(
      (p) => p.id === state.editingProject.id,
    );
    if (idx !== -1) state.projects[idx] = { ...state.projects[idx], ...form };
    state.editingProject = null;
  } else {
    const newProject = { id: Date.now(), ...form, activities: [] };
    state.projects.push(newProject);
    state.currentProjectId = newProject.id;
  }

  state.showProjectModal = false;
  saveState();
  render();
}

function deleteProject(id) {
  showConfirm("Delete this project and all its activities?", () => {
    state.projects = state.projects.filter((p) => p.id !== id);
    if (state.currentProjectId === id) state.currentProjectId = null;
    saveState();
    render();
  });
}

// ────────────────────────────────────────────────
// Activity CRUD with Recurrence
// ────────────────────────────────────────────────
function createOrUpdateActivity(isUpdate = false) {
  const title = document.getElementById("activityTitle")?.value.trim();
  if (!title)
    return showMessage("Input required", "Activity title is required.");

  let assignee = document.getElementById("activityAssigneeSelect")?.value;
  if (assignee === "other") {
    assignee = document.getElementById("activityAssigneeOther")?.value.trim();
  }

  const form = {
    title,
    category: document.getElementById("activityCategory")?.value,
    status: document.getElementById("activityStatus")?.value,
    priority: document.getElementById("activityPriority")?.value,
    assignee: assignee || "",
    dueDate: document.getElementById("activityDueDate")?.value,
    description: document.getElementById("activityDescription")?.value.trim(),
    completionDate:
      document.getElementById("activityCompletionDate")?.value || "",
    recurrence: document.getElementById("activityRecurrence")?.value || "none",
  };

  const project = getCurrentProject();
  if (!project) return;

  if (form.status === "Completed" && !form.completionDate) {
    form.completionDate = new Date().toISOString().split("T")[0];
  }

  if (isUpdate && state.editingActivity) {
    const idx = project.activities.findIndex(
      (a) => a.id === state.editingActivity.id,
    );
    if (idx !== -1)
      project.activities[idx] = { ...project.activities[idx], ...form };
  } else {
    const newActivity = {
      id: Date.now(),
      createdDate: new Date().toISOString(),
      ...form,
    };
    project.activities.push(newActivity);

    if (form.recurrence !== "none" && form.dueDate) {
      const nextDue = generateNextDueDate(form.dueDate, form.recurrence);
      if (nextDue) {
        project.activities.push({
          ...newActivity,
          id: Date.now() + 1,
          dueDate: nextDue,
          status: "Not Started",
          completionDate: "",
        });
      }
    }
  }

  state.showActivityModal = false;
  state.editingActivity = null;
  saveState();
  render();
}

function deleteActivity(id) {
  showConfirm("Delete this activity?", () => {
    const project = getCurrentProject();
    if (project) {
      project.activities = project.activities.filter((a) => a.id !== id);
      saveState();
      render();
    }
  });
}

// ────────────────────────────────────────────────
// Export / Import / PDF (placeholders – add your full logic if needed)
// ────────────────────────────────────────────────

function downloadJSON() {
  const project = getCurrentProject();
  if (!project) return showMessage("No project", "No project selected.");

  // Create export object that includes both the project and the assignees list
  const exportData = {
    project: project,
    assignees: state.assignees.slice().sort((a, b) => a.localeCompare(b)), // sorted copy
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${project.title.replace(/[^a-z0-9]/gi, "_")}_${new Date().toISOString().split("T")[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
function uploadJSON2(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);

      let importedProject;
      let importedAssignees = [];

      // Support both old format (just project) and new format (with assignees)
      if (imported.project) {
        importedProject = imported.project;
        importedAssignees = imported.assignees || [];
      } else {
        // Old format — only project was exported
        importedProject = imported;
      }

      if (
        !importedProject.id ||
        !importedProject.title ||
        !Array.isArray(importedProject.activities)
      ) {
        return showMessage("Invalid format", "Invalid project format.");
      }

      const idx = state.projects.findIndex((p) => p.id === importedProject.id);
      if (idx !== -1) {
        showConfirm(
          `Replace existing project "${importedProject.title}"?`,
          () => {
            state.projects[idx] = importedProject;
            // Merge assignees (avoid duplicates)
            importedAssignees.forEach((name) => {
              if (!state.assignees.includes(name)) {
                state.assignees.push(name);
              }
            });
            state.assignees.sort((a, b) => a.localeCompare(b));
            state.currentProjectId = importedProject.id;
            saveState();
            render();
            showMessage("Imported", "Project replaced + assignees merged.");
          },
        );
      } else {
        state.projects.push(importedProject);
        // Merge assignees
        importedAssignees.forEach((name) => {
          if (!state.assignees.includes(name)) {
            state.assignees.push(name);
          }
        });
        state.assignees.sort((a, b) => a.localeCompare(b));
        state.currentProjectId = importedProject.id;
        saveState();
        render();
        showMessage("Imported", "Project added + assignees merged.");
      }
    } catch (err) {
      showMessage("Error", "Error parsing JSON: " + err.message);
    }
  };
  reader.readAsText(file);
}

function uploadJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);

      let importedProject;
      let importedAssignees = [];

      // Handle both formats
      if (
        imported.project &&
        imported.project.id &&
        imported.project.title &&
        Array.isArray(imported.project.activities)
      ) {
        // New format: { project: {...}, assignees: [...] }
        importedProject = imported.project;
        importedAssignees = imported.assignees || [];
      } else if (
        imported.id &&
        imported.title &&
        Array.isArray(imported.activities)
      ) {
        // Old format: direct project object
        importedProject = imported;
      } else {
        return showMessage(
          "Invalid format",
          "The file does not contain a valid project structure.",
        );
      }

      const idx = state.projects.findIndex((p) => p.id === importedProject.id);
      if (idx !== -1) {
        showConfirm(
          `Replace existing project "${importedProject.title}"?`,
          () => {
            state.projects[idx] = importedProject;
            // Merge assignees (skip duplicates)
            importedAssignees.forEach((name) => {
              if (name && !state.assignees.includes(name)) {
                state.assignees.push(name);
              }
            });
            state.assignees.sort((a, b) => a.localeCompare(b));
            state.currentProjectId = importedProject.id;
            saveState();
            render();
            showMessage("Imported", "Project replaced + assignees merged.");
          },
        );
      } else {
        state.projects.push(importedProject);
        importedAssignees.forEach((name) => {
          if (name && !state.assignees.includes(name)) {
            state.assignees.push(name);
          }
        });
        state.assignees.sort((a, b) => a.localeCompare(b));
        state.currentProjectId = importedProject.id;
        saveState();
        render();
        showMessage("Imported", "Project added + assignees merged.");
      }
    } catch (err) {
      showMessage("Error", "Error parsing JSON: " + err.message);
    }
  };
  reader.readAsText(file);
}
function downloadPDF() {
  const project = getCurrentProject();
  if (!project) return showMessage("No project", "No project selected.");

  const kpis = calculateKPIs(project);
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${project.title} - COE Activity Report</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            margin: 40px;
            line-height: 1.5;
            color: #333;
        }
        h1 {
            color: #1e40af;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        h2 {
            color: #1e293b;
            margin-top: 2em;
        }
        .meta {
            margin-bottom: 30px;
            color: #4b5563;
        }
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 16px;
            margin: 24px 0;
        }
        .kpi-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .kpi-value {
            font-size: 2.25rem;
            font-weight: bold;
            color: #1e40af;
        }
        .kpi-label {
            font-size: 0.875rem;
            color: #64748b;
            margin-top: 4px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
        }
        th, td {
            border: 1px solid #e2e8f0;
            padding: 12px;
            text-align: left;
        }
        th {
            background: #f1f5f9;
            font-weight: 600;
            color: #1e293b;
        }
        tr:nth-child(even) {
            background: #f8fafc;
        }
        .completed {
            background-color: #ecfdf5;
        }
        .overdue {
            background-color: #fef2f2;
            color: #991b1b;
        }
        .recurring {
            color: #7c3aed;
            font-weight: 500;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #6b7280;
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    <h1>${project.title}</h1>

    <div class="meta">
        <strong>Description:</strong> ${project.description || "—"}<br>
        <strong>Created:</strong> ${project.createdDate || "—"}<br>
        <strong>Generated:</strong> ${today}<br>
        <strong>Activities:</strong> ${project.activities.length}
    </div>

    <h2>Key Performance Indicators</h2>
    <div class="kpi-grid">
        <div class="kpi-card">
            <div class="kpi-value">${kpis.total}</div>
            <div class="kpi-label">Total Activities</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-value">${kpis.completionRate}%</div>
            <div class="kpi-label">Completion Rate</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-value">${kpis.completed}</div>
            <div class="kpi-label">Completed</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-value">${kpis.inProgress}</div>
            <div class="kpi-label">In Progress</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-value">${kpis.blocked}</div>
            <div class="kpi-label">Blocked</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-value ${kpis.overdue > 0 ? "text-red-600" : ""}">${kpis.overdue}</div>
            <div class="kpi-label">Overdue</div>
        </div>
    </div>

    <h2>All Activities (${project.activities.length})</h2>
    <table>
        <thead>
            <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assignee</th>
                <th>Due Date</th>
                <th>Completed</th>
                <th>Recurrence</th>
            </tr>
        </thead>
        <tbody>
            ${project.activities
              .map(
                (a) => `
                <tr class="${a.status === "Completed" ? "completed" : ""} ${a.dueDate && a.dueDate < new Date().toISOString().split("T")[0] && a.status !== "Completed" ? "overdue" : ""}">
                    <td>${a.title}</td>
                    <td>${a.category}</td>
                    <td>${a.status}</td>
                    <td>${a.priority}</td>
                    <td>${a.assignee || "—"}</td>
                    <td>${a.dueDate || "—"}</td>
                    <td>${a.completionDate || "—"}</td>
                    <td class="${a.recurrence && a.recurrence !== "none" ? "recurring" : ""}">
                        ${
                          a.recurrence && a.recurrence !== "none"
                            ? recurrenceOptions.find(
                                (o) => o.value === a.recurrence,
                              )?.label || a.recurrence
                            : "—"
                        }
                    </td>
                </tr>
            `,
              )
              .join("")}
        </tbody>
    </table>

    <div class="footer">
        Generated by Salesforce COE Activity Tracker • ${today}
    </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${project.title.replace(/[^a-z0-9]/gi, "_")}_COE_Report_${today.replace(/,/g, "").replace(/ /g, "_")}.html`;
  link.click();
  URL.revokeObjectURL(url);

  showMessage(
    "Report Generated",
    "The report has been downloaded as an HTML file.\nOpen it in your browser and use Print → Save as PDF.",
  );
}

// ────────────────────────────────────────────────
// Status & Priority Colors
// ────────────────────────────────────────────────
function getStatusColor(status) {
  const map = {
    Completed:
      "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
    "In Progress":
      "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
    Blocked: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
    "On Hold":
      "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200",
  };
  return (
    map[status] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
  );
}

function getPriorityColor(priority) {
  const map = {
    Critical: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
    High: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200",
    Medium:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200",
    Low: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  };
  return (
    map[priority] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
  );
}

// ────────────────────────────────────────────────
// Render
// ────────────────────────────────────────────────
function render() {
  const isDark = true;
  const project = getCurrentProject();
  const kpis = calculateKPIs(project);

  document.body.className = `${isDark ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"} theme-transition min-h-screen`;

  let activities = project?.activities || [];

  if (state.activityFilter === "open")
    activities = activities.filter((a) => a.status !== "Completed");
  if (state.activityFilter === "completed")
    activities = activities.filter((a) => a.status === "Completed");
  if (state.activityFilter === "blocked")
    activities = activities.filter((a) => a.status === "Blocked");
  if (state.activityFilter === "high-priority")
    activities = activities.filter((a) =>
      ["High", "Critical"].includes(a.priority),
    );

  if (state.activitySort === "dueDate") {
    activities.sort((a, b) =>
      (a.dueDate || "9999-12-31").localeCompare(b.dueDate || "9999-12-31"),
    );
  } else if (state.activitySort === "priority") {
    const ord = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    activities.sort((a, b) => (ord[b.priority] || 0) - (ord[a.priority] || 0));
  } else if (state.activitySort === "status") {
    const ord = {
      Completed: 1,
      "In Progress": 2,
      Blocked: 3,
      "On Hold": 4,
      "Not Started": 5,
    };
    activities.sort((a, b) => (ord[a.status] || 99) - (ord[b.status] || 99));
  } else if (state.activitySort === "title") {
    activities.sort((a, b) => a.title.localeCompare(b.title));
  }

  const html = `
                <div class="max-w-7xl mx-auto p-4 sm:p-6">

                    <!-- Header -->
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h1 class="text-3xl font-bold text-blue-600 dark:text-blue-400">Salesforce COE Tracker</h1>
                            <p class="text-gray-600 dark:text-gray-400">Center of Excellence Activity Management</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <button onclick="state.showSettingsModal=true; render()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">
                                Settings
                            </button>
                            <button style='display: none;' onclick="toggleTheme()" class="p-3 rounded-xl ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border hover:opacity-90">
                                ${isDark ? "☀️ Light" : "🌙 Dark"}
                            </button>
                        </div>
                    </div>

                    <!-- Projects -->
                    <section class="${isDark ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg p-6 mb-8 border ${isDark ? "border-gray-700" : "border-gray-200"}">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <h2 class="text-2xl font-semibold">Projects</h2>
                            <button onclick="openProjectModal()" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-medium">
                                <span>+</span> New Project
                            </button>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            ${
                              state.projects.length === 0
                                ? `
                                <div class="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                                    No projects yet — create one to begin
                                </div>
                            `
                                : state.projects
                                    .map(
                                      (p) => `
                                <div onclick="selectProject(${p.id})" class="p-5 rounded-xl border-2 cursor-pointer transition-all ${
                                  state.currentProjectId === p.id
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                                    : "border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600"
                                }">
                                    <div class="flex justify-between items-start mb-3">
                                        <h3 class="font-semibold text-lg">${p.title}</h3>
                                        <div class="flex gap-2">
                                            <button onclick="event.stopPropagation(); editProject(${p.id})" class="text-blue-600 hover:text-blue-800 dark:text-blue-400">✎</button>
                                            <button onclick="event.stopPropagation(); deleteProject(${p.id})" class="text-red-600 hover:text-red-800">🗑</button>
                                        </div>
                                    </div>
                                    <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">${p.description || "—"}</p>
                                    <div class="text-xs text-gray-500 dark:text-gray-500">
                                        ${p.activities?.length || 0} activities • ${p.createdDate}
                                    </div>
                                </div>
                            `,
                                    )
                                    .join("")
                            }
                        </div>
                    </section>

                    ${
                      project
                        ? `
                        <!-- KPIs -->
                        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                            <div class="p-5 rounded-xl ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border shadow text-center">
                                <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">${kpis.total}</div>
                                <div class="text-sm text-gray-600 dark:text-gray-400">Total</div>
                            </div>
                            <div class="p-5 rounded-xl ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border shadow text-center">
                                <div class="text-3xl font-bold text-green-600 dark:text-green-400">${kpis.completionRate}%</div>
                                <div class="text-sm text-gray-600 dark:text-gray-400">Done</div>
                            </div>
                            <div class="p-5 rounded-xl ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border shadow text-center">
                                <div class="text-3xl font-bold text-green-600 dark:text-green-400">${kpis.completed}</div>
                                <div class="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                            </div>
                            <div class="p-5 rounded-xl ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border shadow text-center">
                                <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">${kpis.inProgress}</div>
                                <div class="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
                            </div>
                            <div class="p-5 rounded-xl ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border shadow text-center">
                                <div class="text-3xl font-bold text-red-600 dark:text-red-400">${kpis.blocked}</div>
                                <div class="text-sm text-gray-600 dark:text-gray-400">Blocked</div>
                            </div>
                            <div class="p-5 rounded-xl ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border shadow text-center">
                                <div class="text-3xl font-bold ${kpis.overdue ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}">${kpis.overdue}</div>
                                <div class="text-sm text-gray-600 dark:text-gray-400">Overdue</div>
                            </div>
                        </div>

                        <!-- Activity Controls -->
                        <div class="${isDark ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg p-6 mb-8 border ${isDark ? "border-gray-700" : "border-gray-200"}">
                            <div class="flex flex-wrap gap-3 mb-6">
                                <button onclick="openActivityModal()" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-medium">
                                    <span>+</span> Add Activity
                                </button>
                                <button onclick="downloadJSON()" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 font-medium">
                                    ↓ JSON
                                </button>
                                <label class="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg flex items-center gap-2 font-medium cursor-pointer">
                                    ↑ Import
                                    <input type="file" accept=".json" onchange="uploadJSON(event)" class="hidden" />
                                </label>
                                <button onclick="downloadPDF()" class="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center gap-2 font-medium">
                                    📄 Report
                                </button>
                            </div>

                            <div class="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
                                <div class="flex flex-wrap gap-2">
                                    <button onclick="state.activityFilter='all';render()" class="px-4 py-1.5 rounded-lg text-sm ${state.activityFilter === "all" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"}">All</button>
                                    <button onclick="state.activityFilter='open';render()" class="px-4 py-1.5 rounded-lg text-sm ${state.activityFilter === "open" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"}">Open</button>
                                    <button onclick="state.activityFilter='completed';render()" class="px-4 py-1.5 rounded-lg text-sm ${state.activityFilter === "completed" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"}">Done</button>
                                    <button onclick="state.activityFilter='blocked';render()" class="px-4 py-1.5 rounded-lg text-sm ${state.activityFilter === "blocked" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"}">Blocked</button>
                                    <button onclick="state.activityFilter='high-priority';render()" class="px-4 py-1.5 rounded-lg text-sm ${state.activityFilter === "high-priority" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"}">High Priority</button>
                                </div>
                                <select onchange="state.activitySort=this.value; render()" class="px-4 py-2 border ${isDark ? "border-gray-600 bg-gray-700 text-gray-100" : "border-gray-300 bg-white"} rounded-lg">
                                    <option value="dueDate"   ${state.activitySort === "dueDate" ? "selected" : ""}>Due Date</option>
                                    <option value="priority"  ${state.activitySort === "priority" ? "selected" : ""}>Priority</option>
                                    <option value="status"    ${state.activitySort === "status" ? "selected" : ""}>Status</option>
                                    <option value="title"     ${state.activitySort === "title" ? "selected" : ""}>Title</option>
                                </select>
                            </div>

                            ${
                              activities.length > 1
                                ? `
                                <p class="text-sm text-gray-500 dark:text-gray-400 mb-4 italic">
                                    Drag & drop activities to reorder them
                                </p>
                            `
                                : ""
                            }

                            <div class="space-y-4" id="activities-list">
                                ${activities
                                  .map(
                                    (a) => `
                                    <div class="activity-item draggable p-5 rounded-xl border ${isDark ? "border-gray-700 bg-gray-900/50" : "border-gray-200 bg-gray-50"}"
                                         data-activity-id="${a.id}"
                                         draggable="true"
                                         ondragstart="handleDragStart(event)"
                                         ondragend="handleDragEnd(event)"
                                         ondragover="handleDragOver(event)"
                                         ondragenter="handleDragEnter(event)"
                                         ondragleave="handleDragLeave(event)"
                                         ondrop="handleDrop(event)">
                                        <div class="flex justify-between items-start gap-4">
                                            <div class="flex-1">
                                                <div class="flex items-center gap-3 mb-2">
                                                    <span class="text-gray-400 dark:text-gray-500 cursor-move text-xl">⠿</span>
                                                    <h3 class="font-semibold text-lg">${a.title}</h3>
                                                </div>
                                                <div class="flex flex-wrap gap-2 mb-3">
                                                    <span class="px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(a.status)}">${a.status}</span>
                                                    <span class="px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(a.priority)}">${a.priority}</span>
                                                    <span class="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-800/40 text-purple-800 dark:text-purple-200">${a.category}</span>
                                                    ${
                                                      a.dueDate &&
                                                      a.dueDate <
                                                        new Date()
                                                          .toISOString()
                                                          .split("T")[0] &&
                                                      a.status !== "Completed"
                                                        ? `
                                                        <span class="px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-800/40 text-red-800 dark:text-red-200">Overdue</span>
                                                    `
                                                        : ""
                                                    }
                                                    ${
                                                      a.recurrence &&
                                                      a.recurrence !== "none"
                                                        ? `
                                                        <span class="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-800/40 text-indigo-800 dark:text-indigo-200">
                                                            Recurring: ${recurrenceOptions.find((o) => o.value === a.recurrence)?.label || a.recurrence}
                                                        </span>
                                                    `
                                                        : ""
                                                    }
                                                </div>
                                                <div class="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                                                    ${a.assignee ? `<div><strong>Assignee:</strong> ${a.assignee}</div>` : ""}
                                                    ${a.dueDate ? `<div><strong>Due:</strong> ${a.dueDate}</div>` : ""}
                                                    ${a.completionDate ? `<div><strong>Done:</strong> ${a.completionDate}</div>` : ""}
                                                    ${a.description ? `<div class="mt-2"><strong>Notes:</strong> ${a.description}</div>` : ""}
                                                </div>
                                            </div>
                                            <div class="flex gap-3 mt-1">
                                                <button onclick="editActivity(${a.id})" class="text-blue-600 hover:text-blue-800 dark:text-blue-400">✎</button>
                                                <button onclick="deleteActivity(${a.id})" class="text-red-600 hover:text-red-800">🗑</button>
                                            </div>
                                        </div>
                                    </div>
                                `,
                                  )
                                  .join("")}
                            </div>

                            ${
                              activities.length === 0
                                ? `
                                <div class="text-center py-12 text-gray-500 dark:text-gray-400">
                                    No activities${state.activityFilter !== "all" ? " match current filter" : ""}.
                                </div>
                            `
                                : ""
                            }
                        </div>
                    `
                        : ""
                    }

                    <!-- Settings Modal -->
                    ${
                      state.showSettingsModal
                        ? `
                        <div class="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 modal-enter" onclick="if(event.target===this) {state.showSettingsModal=false; render()}">
                            <div class="${isDark ? "bg-gray-800" : "bg-white"} rounded-xl shadow-2xl max-w-lg w-full p-6" onclick="event.stopPropagation()">
                                <div class="flex justify-between items-center mb-5">
                                    <h3 class="text-xl font-bold">Settings – Manage Assignees</h3>
                                    <button onclick="state.showSettingsModal=false; render()" class="text-2xl text-gray-500 hover:text-gray-700">×</button>
                                </div>

                                <div class="mb-6">
                                    <label class="block text-sm font-medium mb-2">Add new assignee</label>
                                    <div class="flex gap-3">
                                        <input type="text" placeholder="Name or email" 
                                            value="${state.newAssignee}" 
                                            oninput="state.newAssignee = this.value" 
                                            class="flex-1 px-4 py-2.5 border ${isDark ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"} rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                                        <button onclick="addAssignee()" class="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">Add</button>
                                    </div>
                                </div>

                                <div class="mb-6">
                                    <h4 class="text-lg font-medium mb-3">Current Assignees (${state.assignees.length})</h4>
                                    ${
                                      state.assignees.length === 0
                                        ? `
                                        <p class="text-gray-500 dark:text-gray-400 italic text-center py-4">No assignees added yet</p>
                                    `
                                        : `
                                        <div class="space-y-2 max-h-60 overflow-y-auto pr-2">
                                            ${state.assignees
                                              .map(
                                                (name) => `
                                                <div class="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                    <span class="font-medium">${name}</span>
                                                    <button onclick="removeAssignee('${name.replace(/'/g, "\\'")}')" class="text-red-600 hover:text-red-800 text-sm font-medium">Remove</button>
                                                </div>
                                            `,
                                              )
                                              .join("")}
                                        </div>
                                    `
                                    }
                                </div>

                                <button onclick="state.showSettingsModal=false; render()" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                                    Close Settings
                                </button>
                            </div>
                        </div>
                    `
                        : ""
                    }

                    <!-- Confirm Modal -->
                    ${
                      state.showConfirmModal
                        ? `
                        <div class="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100] modal-enter">
                            <div class="${isDark ? "bg-gray-800" : "bg-white"} rounded-xl shadow-2xl max-w-md w-full p-6">
                                <h3 class="text-xl font-semibold mb-4">Confirm Action</h3>
                                <p class="text-gray-700 dark:text-gray-300 mb-6">${state.confirmMessage}</p>
                                <div class="flex gap-4">
                                    <button onclick="closeConfirm(true)" class="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">Yes</button>
                                    <button onclick="closeConfirm(false)" class="flex-1 py-3 border ${isDark ? "border-gray-600 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-100"} rounded-lg">No</button>
                                </div>
                            </div>
                        </div>
                    `
                        : ""
                    }

                    <!-- Message Modal -->
                    ${
                      state.showMessageModal
                        ? `
                        <div class="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100] modal-enter">
                            <div class="${isDark ? "bg-gray-800" : "bg-white"} rounded-xl shadow-2xl max-w-md w-full p-6">
                                <h3 class="text-xl font-semibold mb-4">${state.messageTitle}</h3>
                                <p class="text-gray-700 dark:text-gray-300 mb-6">${state.messageContent}</p>
                                <button onclick="closeMessage()" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">OK</button>
                            </div>
                        </div>
                    `
                        : ""
                    }

                    <!-- Project Modal -->
                    ${
                      state.showProjectModal
                        ? `
                        <div class="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 modal-enter" onclick="if(event.target===this) closeProjectModal()">
                            <div class="${isDark ? "bg-gray-800" : "bg-white"} rounded-xl shadow-2xl max-w-lg w-full p-6" onclick="event.stopPropagation()">
                                <div class="flex justify-between items-center mb-5">
                                    <h3 class="text-xl font-bold">${state.editingProject ? "Edit Project" : "New Project"}</h3>
                                    <button onclick="closeProjectModal()" class="text-2xl text-gray-500 hover:text-gray-700">×</button>
                                </div>
                                <div class="space-y-5">
                                    <div>
                                        <label class="block text-sm font-medium mb-1.5">Title <span class="text-red-500">*</span></label>
                                        <input id="projectTitle" value="${state.projectForm.title}" class="w-full px-4 py-2.5 border ${isDark ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-1.5">Description</label>
                                        <textarea id="projectDescription" rows="3" class="w-full px-4 py-2.5 border ${isDark ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">${state.projectForm.description}</textarea>
                                    </div>
                                    <div class="flex gap-4">
                                        <button onclick="createOrUpdateProject(${!!state.editingProject})" class="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                                            ${state.editingProject ? "Update" : "Create"}
                                        </button>
                                        <button onclick="closeProjectModal()" class="flex-1 py-3 border ${isDark ? "border-gray-600 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-100"} rounded-lg">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `
                        : ""
                    }

                    <!-- Activity Modal -->
                    ${
                      state.showActivityModal
                        ? `
                        <div class="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 modal-enter" onclick="if(event.target===this) closeActivityModal()">
                            <div class="${isDark ? "bg-gray-800" : "bg-white"} rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[92vh] overflow-y-auto" onclick="event.stopPropagation()">
                                <div class="flex justify-between items-center mb-5">
                                    <h3 class="text-xl font-bold">${state.editingActivity ? "Edit Activity" : "New Activity"}</h3>
                                    <button onclick="closeActivityModal()" class="text-2xl text-gray-500 hover:text-gray-700">×</button>
                                </div>
                                <div class="space-y-5">
                                    <div>
                                        <label class="block text-sm font-medium mb-1.5">Title <span class="text-red-500">*</span></label>
                                        <input id="activityTitle" value="${state.activityForm.title}" class="w-full px-4 py-2.5 border ${isDark ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label class="block text-sm font-medium mb-1.5">Category</label>
                                            <select id="activityCategory" class="w-full px-4 py-2.5 border ${isDark ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                                ${categories.map((c) => `<option value="${c}" ${state.activityForm.category === c ? "selected" : ""}>${c}</option>`).join("")}
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium mb-1.5">Status</label>
                                            <select id="activityStatus" class="w-full px-4 py-2.5 border ${isDark ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                                ${statuses.map((s) => `<option value="${s}" ${state.activityForm.status === s ? "selected" : ""}>${s}</option>`).join("")}
                                            </select>
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label class="block text-sm font-medium mb-1.5">Priority</label>
                                            <select id="activityPriority" class="w-full px-4 py-2.5 border ${isDark ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                                ${priorities.map((p) => `<option value="${p}" ${state.activityForm.priority === p ? "selected" : ""}>${p}</option>`).join("")}
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium mb-1.5">Assignee</label>
                                            <select id="activityAssigneeSelect" class="w-full px-4 py-2.5 border ${isDark ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                                <option value="">-- Select or type --</option>
                                                ${state.assignees
                                                  .map(
                                                    (name) => `
                                                    <option value="${name}" ${state.activityForm.assignee === name ? "selected" : ""}>${name}</option>
                                                `,
                                                  )
                                                  .join("")}
                                                <option value="other">Other (type below)...</option>
                                            </select>
                                            <input id="activityAssigneeOther" type="text" placeholder="Enter custom assignee name" 
                                                value="${state.activityForm.assignee && !state.assignees.includes(state.activityForm.assignee) ? state.activityForm.assignee : ""}"
                                                class="w-full px-4 py-2.5 mt-2 border ${isDark ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${document.getElementById("activityAssigneeSelect")?.value === "other" ? "" : "hidden"}" />
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label class="block text-sm font-medium mb-1.5">Due Date</label>
                                            <input type="date" id="activityDueDate" value="${state.activityForm.dueDate}" class="w-full px-4 py-2.5 border ${isDark ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium mb-1.5">Completed Date</label>
                                            <input type="date" id="activityCompletionDate" value="${state.activityForm.completionDate}" class="w-full px-4 py-2.5 border ${isDark ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-1.5">Recurrence</label>
                                        <select id="activityRecurrence" class="w-full px-4 py-2.5 border ${isDark ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                            ${recurrenceOptions
                                              .map(
                                                (opt) => `
                                                <option value="${opt.value}" ${state.activityForm.recurrence === opt.value ? "selected" : ""}>
                                                    ${opt.label}
                                                </option>
                                            `,
                                              )
                                              .join("")}
                                        </select>
                                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            When marked Completed, next instance will be created automatically
                                        </p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-1.5">Description / Notes</label>
                                        <textarea id="activityDescription" rows="4" class="w-full px-4 py-2.5 border ${isDark ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">${state.activityForm.description}</textarea>
                                    </div>
                                    <div class="flex gap-4 pt-3">
                                        <button onclick="createOrUpdateActivity(${!!state.editingActivity})" class="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                                            ${state.editingActivity ? "Update Activity" : "Add Activity"}
                                        </button>
                                        <button onclick="closeActivityModal()" class="flex-1 py-3 border ${isDark ? "border-gray-600 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-100"} rounded-lg">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `
                        : ""
                    }
                </div>
            `;

  document.getElementById("app").innerHTML = html;

  // Re-attach drag events
  document.querySelectorAll(".activity-item").forEach((item) => {
    item.addEventListener("dragstart", handleDragStart);
    item.addEventListener("dragend", handleDragEnd);
    item.addEventListener("dragover", handleDragOver);
    item.addEventListener("dragenter", handleDragEnter);
    item.addEventListener("dragleave", handleDragLeave);
    item.addEventListener("drop", handleDrop);
  });

  // Enter key support in modals
  document.querySelectorAll("input, select, textarea").forEach((el) => {
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && el.tagName !== "TEXTAREA" && !e.shiftKey) {
        e.preventDefault();
        if (state.showProjectModal)
          createOrUpdateProject(!!state.editingProject);
        if (state.showActivityModal)
          createOrUpdateActivity(!!state.editingActivity);
      }
    });
  });
}

// ────────────────────────────────────────────────
// Modal & Theme Handlers
// ────────────────────────────────────────────────
function toggleTheme() {
  state.theme = state.theme === "light" ? "dark" : "light";
  localStorage.setItem("theme", state.theme);
  render();
}

function openProjectModal() {
  state.editingProject = null;
  state.projectForm = {
    title: "",
    description: "",
    createdDate: new Date().toISOString().split("T")[0],
  };
  state.showProjectModal = true;
  render();
}

function editProject(id) {
  const p = state.projects.find((p) => p.id === id);
  if (p) {
    state.editingProject = p;
    state.projectForm = { ...p };
    state.showProjectModal = true;
    render();
  }
}

function closeProjectModal() {
  state.showProjectModal = false;
  render();
}

function selectProject(id) {
  state.currentProjectId = id;
  saveState();
  render();
}

function openActivityModal() {
  state.editingActivity = null;
  state.activityForm = {
    title: "",
    category: "Governance",
    status: "Not Started",
    priority: "Medium",
    assignee: "",
    dueDate: "",
    description: "",
    completionDate: "",
    recurrence: "none",
  };
  state.showActivityModal = true;
  render();
}

function editActivity(id) {
  const a = getCurrentProject()?.activities.find((a) => a.id === id);
  if (a) {
    state.editingActivity = a;
    state.activityForm = { ...a };
    state.showActivityModal = true;
    render();
  }
}

function closeActivityModal() {
  state.showActivityModal = false;
  render();
}

// Initial render
render();
