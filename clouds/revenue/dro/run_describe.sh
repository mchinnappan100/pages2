#!/bin/bash

# Usage: ./run-describe.sh --json-input input.json --username your_username

while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    --json-input)
      INPUT_FILE="$2"
      shift; shift
      ;;
    --username)
      USERNAME="$2"
      shift; shift
      ;;
    *)
      echo "❌ Unknown argument: $1"
      exit 1
      ;;
  esac
done

if [[ -z "$INPUT_FILE" || -z "$USERNAME" ]]; then
  echo "❌ Usage: $0 --json-input input.json --username your_username"
  exit 1
fi

# Extract all 'name' fields from queries array using jq
OBJECT_NAMES=$(jq -r '.queries[].name' "$INPUT_FILE")

if [[ -z "$OBJECT_NAMES" ]]; then
  echo "❌ No object names found in input JSON."
  exit 1
fi

for OBJECT in $OBJECT_NAMES; do
  echo "🔍 Processing object: $OBJECT"
  OUTPUT_CSV="${OBJECT}.csv"
  OUTPUT_SVG="${OBJECT}.svg"
  echo sf mohanc md describe -u "$USERNAME" -s "$OBJECT" -e "$OUTPUT_SVG" > "$OUTPUT_CSV"
  sf mohanc md describe -u "$USERNAME" -s "$OBJECT" -e "$OUTPUT_SVG" > "$OUTPUT_CSV"

done

echo "✅ Done."
