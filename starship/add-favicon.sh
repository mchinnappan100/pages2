#!/usr/bin/env bash
# add-favicon.sh — insert favicon <link> after </title> in HTML files
# Usage:  add-favicon.sh file.html [file2.html ...]
#         add-favicon.sh *.html

set -euo pipefail

FAVICON='<link rel="icon" href="https://mohan-chinnappan-n5.github.io/dfv/img/mc_favIcon.ico"/>'

if [[ $# -eq 0 ]]; then
    echo "Usage: $(basename "$0") file.html [file2.html ...]" >&2
    exit 1
fi

for file in "$@"; do
    if [[ ! -f "$file" ]]; then
        echo "SKIP  $file (not found)" >&2
        continue
    fi

    # Skip if favicon already present
    if grep -qF 'mc_favIcon.ico' "$file"; then
        echo "SKIP  $file (favicon already present)"
        continue
    fi

    # Insert favicon line immediately after </title>
    sed -i '' "s|</title>|</title>\n${FAVICON}|" "$file"
    echo "DONE  $file"
done
EOF
