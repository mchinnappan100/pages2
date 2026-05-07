// ============================================================
// HELP PANEL
// ============================================================
function openHelp() {
  document.getElementById('helpBackdrop').classList.add('open');
  document.getElementById('helpPanel').classList.add('open');
}
function closeHelp() {
  document.getElementById('helpBackdrop').classList.remove('open');
  document.getElementById('helpPanel').classList.remove('open');
}
function switchHelpTab(page, tabEl) {
  document.querySelectorAll('.help-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.help-page').forEach(p => p.classList.remove('active'));
  tabEl.classList.add('active');
  document.getElementById('help-' + page).classList.add('active');
  document.querySelector('.help-body').scrollTop = 0;
}