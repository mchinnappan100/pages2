#!/usr/bin/env bash
# add_icon.sh: insert a favicon <link> before </head> in each HTML file
ICON='<link rel="icon" type="image/x-icon" href="https://mohan-chinnappan-n5.github.io/dfv/img/mc_favIcon.ico"/>'

for f in "$@"; do
  if grep -qi 'rel="icon"\|rel="shortcut icon"' "$f"; then
    echo "skip (has icon): $f"; continue
  fi
  sed -i.bak "/<\/head>/i\\
  $ICON
" "$f" && echo "updated: $f"
done