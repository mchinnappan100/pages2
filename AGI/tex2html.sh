# Try pandoc: .tex -> html (with MathJax), then chrome -> pdf
# First test the .tex -> html conversion
pandoc \
  --from=latex \
  --to=html5 \
  --standalone \
  --mathjax \
  --highlight-style=tango \
  --metadata title="Open Questions in AI" \
  -o /tmp/oq-test.html \
  /Users/mchinnappan/github-pages/pages2/AGI/open-questions-ai.tex 2>&1 | head -20
echo "exit: $?"
ls -lh /tmp/oq-test.html 2>/dev/null