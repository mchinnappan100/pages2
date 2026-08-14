const urlParams = new URLSearchParams(window.location.search);
const publisher = urlParams.get("u");
const titleEl = document.getElementById("title");
const tableBody = document.getElementById("tableBody");
const searchInput = document.getElementById("searchInput");
const shownCount = document.getElementById("shownCount");
const totalCount = document.getElementById("totalCount");
const pageSizeEl = document.getElementById("pageSize");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const currentPageEl = document.getElementById("currentPage");
const pageCountEl = document.getElementById("pageCount");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const darkToggle = document.getElementById("darkToggle");
const publisherAvatar = document.getElementById("publisherAvatar");
const kpiToggle = document.getElementById("kpiToggle");
const kpiPanel = document.getElementById("kpiPanel");
const kpiChevron = document.getElementById("kpiChevron");
let monthlyChart = null;

let packages = [];
let state = { query: "", sortBy: null, sortDir: 1, page: 1, pageSize: 10 };

if (!publisher) {
  tableBody.innerHTML =
    '<tr><td colspan="5" class="px-4 py-8 text-center text-red-500">❌ Add ?u=publisher to the URL</td></tr>';
  throw new Error("Missing publisher name");
}

titleEl.textContent = `📦 NPM Packages — ${publisher}`;

// npm profile avatars are served by the npm CDN at this path (redirects to Gravatar internally)
function loadAvatar(email) {
  const url = `https://www.npmjs.com/npm-avatar/${encodeURIComponent(publisher)}`;
  publisherAvatar.src = url;
  publisherAvatar.classList.remove("hidden");
  publisherAvatar.onerror = () => publisherAvatar.classList.add("hidden");
}

function countUp(el, target, duration = 800) {
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

async function fetchData() {
  const url = `https://registry.npmjs.org/-/v1/search?text=maintainer:${encodeURIComponent(
    publisher
  )}&size=250`;
  const res = await fetch(url);
  const data = await res.json();
  const publisherEmail = data.objects[0]?.package?.publisher?.email ?? "";
  packages = data.objects.map((obj) => ({
    name: obj.package.name,
    version: obj.package.version,
    description: obj.package.description || "",
    link: obj.package.links.npm,
    date: obj.package.date,
  }));
  totalCount.textContent = packages.length;
  renderKpi();
  render();
  loadAvatar(publisherEmail);
}

function renderKpi() {
  const thisYear = new Date().getFullYear();
  const sorted = [...packages].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latest = sorted[0];
  const oldest = sorted[sorted.length - 1];
  const thisYearCount = packages.filter(p => new Date(p.date).getFullYear() === thisYear).length;

  countUp(document.getElementById("kpi-total"), packages.length);
  document.getElementById("kpi-latest-name").textContent = latest?.name ?? "—";
  document.getElementById("kpi-latest-date").textContent = latest ? new Date(latest.date).toLocaleDateString() : "—";
  document.getElementById("kpi-oldest-name").textContent = oldest?.name ?? "—";
  document.getElementById("kpi-oldest-date").textContent = oldest ? new Date(oldest.date).toLocaleDateString() : "—";
  countUp(document.getElementById("kpi-this-year"), thisYearCount);
  renderChart();
}

function renderChart() {
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  // Build a map of YYYY-MM -> count across all years
  const counts = {};
  packages.forEach(p => {
    const d = new Date(p.date);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2,"0")}`;
    counts[key] = (counts[key] || 0) + 1;
  });

  // Sort keys chronologically and build labels/data
  const keys = Object.keys(counts).sort();
  const labels = keys.map(k => {
    const [yr, mo] = k.split("-");
    return `${MONTHS[parseInt(mo)]} ${yr}`;
  });
  const data = keys.map(k => counts[k]);

  const isDark = document.documentElement.classList.contains("dark");
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const tickColor = isDark ? "#9ca3af" : "#6b7280";
  const barColor = isDark ? "rgba(96,165,250,0.8)" : "rgba(59,130,246,0.75)";
  const barHover = isDark ? "rgba(147,197,253,0.9)" : "rgba(37,99,235,0.9)";

  if (monthlyChart) monthlyChart.destroy();

  monthlyChart = new Chart(document.getElementById("monthlyChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Packages published",
        data,
        backgroundColor: barColor,
        hoverBackgroundColor: barHover,
        borderRadius: 4,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: items => items[0].label,
            label: item => ` ${item.raw} package${item.raw !== 1 ? "s" : ""}`,
          }
        }
      },
      scales: {
        x: {
          ticks: { color: tickColor, maxRotation: 45, font: { size: 11 } },
          grid: { color: gridColor },
        },
        y: {
          beginAtZero: true,
          ticks: { color: tickColor, precision: 0, font: { size: 11 } },
          grid: { color: gridColor },
        }
      }
    }
  });
}

function highlight(text, query) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(`(${escaped})`, "gi"), "<mark class=\"bg-yellow-200 dark:bg-yellow-700 text-inherit rounded-sm px-0.5\">$1</mark>");
}

function filterAndSort() {
  const q = state.query.toLowerCase();
  let filtered = packages.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
  );
  if (state.sortBy) {
    filtered.sort((a, b) => {
      const aVal =
        state.sortBy === "date"
          ? new Date(a.date)
          : a[state.sortBy].toLowerCase();
      const bVal =
        state.sortBy === "date"
          ? new Date(b.date)
          : b[state.sortBy].toLowerCase();
      if (aVal < bVal) return -state.sortDir;
      if (aVal > bVal) return state.sortDir;
      return 0;
    });
  }
  return filtered;
}

function render() {
  const filtered = filterAndSort();
  const total = filtered.length;
  const pageCount = Math.ceil(total / state.pageSize);
  state.page = Math.min(state.page, pageCount || 1);
  currentPageEl.textContent = state.page;
  pageCountEl.textContent = pageCount;
  const start = (state.page - 1) * state.pageSize;
  const end = start + state.pageSize;
  const pageItems = filtered.slice(start, end);
  shownCount.textContent = pageItems.length;
  prevPageBtn.disabled = state.page <= 1;
  nextPageBtn.disabled = state.page >= pageCount;
  tableBody.innerHTML =
    pageItems
      .map(
        (p, i) => `
          <tr class="${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'} hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
            <td class="px-4 py-3 font-medium"><a href="${
              p.link
            }" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline">${highlight(p.name, state.query)}</a></td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-sm">${p.version}</td>
            <td class="px-4 py-3">${highlight(p.description, state.query)}</td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">${new Date(p.date).toLocaleDateString()}</td>
            <td class="px-4 py-3"><a href="${
              p.link
            }" target="_blank" class="inline-flex items-center gap-1 px-3 py-1 rounded-md border border-blue-400 dark:border-blue-500 text-blue-600 dark:text-blue-300 text-xs font-semibold hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-colors">View <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/></svg></a></td>
          </tr>`
      )
      .join("") ||
    `<tr><td colspan="5" class="px-4 py-16 text-center">
        <div class="flex flex-col items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
          </svg>
          <p class="text-gray-500 dark:text-gray-400 font-medium">No packages match <span class="font-semibold text-gray-700 dark:text-gray-200">"${state.query}"</span></p>
          <button onclick="document.getElementById('searchInput').value='';document.getElementById('searchInput').dispatchEvent(new Event('input'))" class="mt-1 px-4 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Clear search</button>
        </div>
      </td></tr>`;
}

searchInput.addEventListener("input", (e) => {
  state.query = e.target.value;
  state.page = 1;
  render();
});

pageSizeEl.addEventListener("change", (e) => {
  state.pageSize = parseInt(e.target.value);
  state.page = 1;
  render();
});

prevPageBtn.addEventListener("click", () => {
  if (state.page > 1) {
    state.page--;
    render();
  }
});

nextPageBtn.addEventListener("click", () => {
  const filtered = filterAndSort();
  const pageCount = Math.ceil(filtered.length / state.pageSize);
  if (state.page < pageCount) {
    state.page++;
    render();
  }
});

document.querySelectorAll(".sortable").forEach((th) => {
  th.addEventListener("click", () => {
    const col = th.dataset.col;
    if (state.sortBy === col) state.sortDir = -state.sortDir;
    else {
      state.sortBy = col;
      state.sortDir = 1;
    }
    document
      .querySelectorAll(".sort-indicator")
      .forEach((el) => (el.textContent = ""));
    document.getElementById(`si-${col}`).textContent =
      state.sortDir === 1 ? "▲" : "▼";
    render();
  });
});

exportCsvBtn.addEventListener("click", () => {
  const filtered = filterAndSort();
  const csv = ["name,version,description,date,link"]
    .concat(
      filtered.map(
        (p) =>
          `"${p.name}","${p.version}","${p.description.replace(/"/g, '""')}","${
            p.date
          }","${p.link}"`
      )
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${publisher}_packages.csv`;
  a.click();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "/" && document.activeElement !== searchInput) {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
  if (e.key === "Escape" && document.activeElement === searchInput) {
    searchInput.blur();
  }
});

darkToggle.addEventListener("change", (e) => {
  document.documentElement.classList.toggle("dark", e.target.checked);
  if (packages.length) renderChart();
});

kpiToggle.addEventListener("click", () => {
  const collapsed = kpiPanel.style.display === "none";
  kpiPanel.style.display = collapsed ? "" : "none";
  kpiChevron.style.transform = collapsed ? "" : "rotate(-90deg)";
});

fetchData();
