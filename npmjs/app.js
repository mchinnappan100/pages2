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

let packages = [];
let state = { query: "", sortBy: null, sortDir: 1, page: 1, pageSize: 10 };

if (!publisher) {
  tableBody.innerHTML =
    '<tr><td colspan="5" class="px-4 py-8 text-center text-red-500">❌ Add ?u=publisher to the URL</td></tr>';
  throw new Error("Missing publisher name");
}

titleEl.textContent = `📦 NPM Packages — ${publisher}`;

async function fetchData() {
  const url = `https://registry.npmjs.org/-/v1/search?text=maintainer:${encodeURIComponent(
    publisher
  )}&size=250`;
  const res = await fetch(url);
  const data = await res.json();
  packages = data.objects.map((obj) => ({
    name: obj.package.name,
    version: obj.package.version,
    description: obj.package.description || "",
    link: obj.package.links.npm,
    date: obj.package.date,
  }));
  totalCount.textContent = packages.length;
  render();
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
  tableBody.innerHTML =
    pageItems
      .map(
        (p) => `
          <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="px-4 py-3"><a href="${
              p.link
            }" target="_blank" class="underline">${p.name}</a></td>
            <td class="px-4 py-3">${p.version}</td>
            <td class="px-4 py-3">${p.description}</td>
            <td class="px-4 py-3">${new Date(p.date).toLocaleDateString()}</td>
            <td class="px-4 py-3"><a href="${
              p.link
            }" target="_blank" class="text-sm">View</a></td>
          </tr>`
      )
      .join("") ||
    `<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">No results</td></tr>`;
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

darkToggle.addEventListener("change", (e) => {
  document.documentElement.classList.toggle("dark", e.target.checked);
});

fetchData();
