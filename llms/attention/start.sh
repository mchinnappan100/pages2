#!/usr/bin/env bash
# Use the Python 3.11 install that has notebook/jupyter
PYTHON=/opt/homebrew/opt/python@3.11/bin/python3.11
# ─────────────────────────────────────────────────────────────
# Launches both servers needed for the Transformer paper viewer:
#
#   1. Static file server  →  http://localhost:8000
#   2. Jupyter Notebook    →  http://localhost:8888
# ─────────────────────────────────────────────────────────────

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
ATTN_DIR="$(dirname "$0")"

echo "──────────────────────────────────────────"
echo " Transformer Paper Viewer — launcher"
echo "──────────────────────────────────────────"
echo " Page URL : http://localhost:8000/github-pages/pages2/llms/attention/index.html"
echo " Jupyter  : http://localhost:8888"
echo "──────────────────────────────────────────"

# ── Ensure notebook package is installed ──────────────────
if ! $PYTHON -c "import notebook" 2>/dev/null; then
  echo ""
  echo "Installing Jupyter Notebook (one-time)…"
  $PYTHON -m pip install notebook --quiet
fi

# ── 1. Static HTTP server ──────────────────────────────────
cd "$REPO_ROOT/.." || { echo "Cannot cd to $REPO_ROOT/.."; exit 1; }
echo ""
echo "Starting static server at http://localhost:8000 …"
$PYTHON -m http.server 8000 &
HTTP_PID=$!
echo "  PID: $HTTP_PID"

# ── 2. Jupyter Notebook ────────────────────────────────────
echo ""
echo "Starting Jupyter Notebook at http://localhost:8888 …"
$PYTHON -m jupyter notebook \
  --no-browser \
  --port=8888 \
  --notebook-dir="$ATTN_DIR" \
  --ServerApp.allow_origin='*' \
  --ServerApp.token='' \
  --ServerApp.password='' \
  --ServerApp.disable_check_xsrf=True \
  --ServerApp.allow_credentials=True &
JUPYTER_PID=$!
echo "  PID: $JUPYTER_PID"

echo ""
echo "──────────────────────────────────────────"
echo " Open: http://localhost:8000/github-pages/pages2/llms/attention/"
echo " Click the kernel chip → Connect & Start Kernel (token is blank)"
echo "──────────────────────────────────────────"
echo " Press Ctrl-C to stop everything."
echo ""

# ── 3. Open browser after a short delay (let servers start) ───
sleep 2
open "http://localhost:8000/github-pages/pages2/llms/attention/" 2>/dev/null \
  || xdg-open "http://localhost:8000/github-pages/pages2/llms/attention/" 2>/dev/null \
  || echo "  (Could not auto-open browser — visit the URL above manually)"

trap "echo ''; echo 'Stopping…'; kill $HTTP_PID $JUPYTER_PID 2>/dev/null; exit 0" INT TERM
wait
