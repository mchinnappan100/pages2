# Good! Now chrome headless -> PDF from that HTML
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new \
  --print-to-pdf="/Users/mchinnappan/github-pages/pages2/AGI/open-questions-ai-from-tex.pdf" \
  --print-to-pdf-no-header \
  --no-sandbox \
  --disable-gpu \
  --run-all-compositor-stages-before-draw \
  "file:///tmp/oq-test.html" 2>&1 | grep -v "^$"
ls -lh /Users/mchinnappan/github-pages/pages2/AGI/open-questions-ai-from-tex.pdf 2>/dev/null