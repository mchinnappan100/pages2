#!/usr/bin/env bash
# Usage:
# ./assign_permsets.sh \
#   --org myOrgAlias \
#   --permsets "PermA,PermB" \
#   --users "user1@example.com,user2@example.com" \
#   [--json]

# This script assigns permission sets to users in a Salesforce org.
# author: Mohan Chinnappan
#-----------------------------------------------------------


set -euo pipefail

# Initialize JSON flag empty
JSON_FLAG=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --org)       ORG_ALIAS="$2"; shift 2 ;;
    --permsets)  IFS=',' read -r -a PERMSETS <<< "${2//\"/}"; shift 2 ;;
    --users)     IFS=',' read -r -a USERS <<< "${2//\"/}"; shift 2 ;;
    --json)      JSON_FLAG="--json"; shift ;;
    *) echo "❌ Unknown argument: $1"; exit 1 ;;
  esac
done

# Validate inputs
if [[ -z "${ORG_ALIAS:-}" || ${#PERMSETS[@]} -eq 0 || ${#USERS[@]} -eq 0 ]]; then
  echo "Usage: --org <orgAlias> --permsets \"Perm1,Perm2\" --users \"user1,user2\" [--json]"
  exit 1
fi

# Build base command
CMD=(sf org assign permset --target-org "$ORG_ALIAS")

# Add each permission set
for PS in "${PERMSETS[@]}"; do
  CMD+=(--name "$PS")
done

# Add each user as on-behalf-of
for U in "${USERS[@]}"; do
  CMD+=(--on-behalf-of "$U")
done

# Execute the command
"${CMD[@]}" $JSON_FLAG
