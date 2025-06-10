#!/usr/bin/env bash
# ------------------------------------------------------------
# Usage:
# ./create_and_apply_permset.sh \
#   --org myOrgAlias \
#   --name MyCustomPS \
#   --label "My Custom Perm Set" \
#   --object_perms "Account:Read:Edit,Contact:Read:" \
#   --field_perms "Account.Phone:Read:Edit" \
#   --users "user1@example.com,user2@example.com" \
#   [--json]

# This script creates a Salesforce Permission Set with specified object and field permissions,
# deploys it, and optionally assigns it to specified users.

# example:
# ./create_and_apply_permset.sh --org  mohan.chinnappan.n.ea10@gmail.com --name MCTestPS --label 'MC Test PS' --object_perms "Account:Read:Edit,Contact:Read" --field_perms "Account.Phone:Read:Edit" --users mohan.chinnappan.n.ea10@gmail.com 

# author: Mohan Chinnappan
# ------------------------------------------------------------

set -euo pipefail
JSON_FLAG=""

# Parse CLI args
while [[ $# -gt 0 ]]; do
  case $1 in
    --org) ORG="$2"; shift 2;;
    --name) API_NAME="$2"; shift 2;;
    --label) LABEL="$2"; shift 2;;
    --object_perms) IFS=',' read -r -a OBJ_PERMS <<< "${2//\"/}"; shift 2;;
    --field_perms) IFS=',' read -r -a FIELD_PERMS <<< "${2//\"/}"; shift 2;;
    --users) IFS=',' read -r -a USERS <<< "${2//\"/}"; shift 2;;
    --json) JSON_FLAG="--json"; shift;;
    *) echo "❌ Unknown arg: $1"; exit 1;;
  esac
done

# Validate essential inputs
if [[ -z "${ORG:-}" || -z "${API_NAME:-}" || -z "${LABEL:-}" ]]; then
  echo "Usage: --org <orgAlias> --name <API_Name> --label <Label> [--object_perms ...] [--field_perms ...] [--users ...] [--json]"
  exit 1
fi

# 1. Generate metadata XML file
# Create a new Salesforce project mywork if it doesn't exist

sf project generate --name mywork 
PS_DIR="mywork/force-app/main/default/permissionsets"
#
PS_FOLDER="force-app/main/default/permissionsets"

mkdir -p "$PS_DIR"
PS_FILE="${PS_DIR}/${API_NAME}.permissionset-meta.xml"

cat > "$PS_FILE" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<PermissionSet xmlns="http://soap.sforce.com/2006/04/metadata">
  <label>${LABEL}</label>
EOF

# Add object permissions (CRUD flags true/false)
for entry in "${OBJ_PERMS[@]:-}"; do
  IFS=':' read -r OBJ R E <<< "$entry"
  READ_FLAG=$(echo "$R" | tr '[:upper:]' '[:lower:]')
  EDIT_FLAG=$(echo "$E" | tr '[:upper:]' '[:lower:]')

  if [[ "$READ_FLAG" == "read" ]]; then
    READ_FLAG=true
  else
    READ_FLAG=false
  fi

  if [[ "$EDIT_FLAG" == "edit" ]]; then
    EDIT_FLAG=true
  else
    EDIT_FLAG=false
  fi

  cat >> "$PS_FILE" <<EOF

  <objectPermissions>
    <object>${OBJ}</object>
    <allowRead>${READ_FLAG}</allowRead>
    <allowEdit>${EDIT_FLAG}</allowEdit>
    <modifyAllRecords>false</modifyAllRecords>
    <viewAllRecords>false</viewAllRecords>
  </objectPermissions>
EOF
done

# Add field-level permissions
for entry in "${FIELD_PERMS[@]:-}"; do
  IFS=':' read -r FF R F <<< "$entry"
  READ_FLAG=$(echo "$R" | tr '[:upper:]' '[:lower:]')
  EDIT_FLAG=$(echo "$F" | tr '[:upper:]' '[:lower:]')

  
  if [[ "$READ_FLAG" == "read" ]]; then
    READ_FLAG=true
  else
    READ_FLAG=false
  fi

  if [[ "$EDIT_FLAG" == "edit" ]]; then
    EDIT_FLAG=true
  else
    EDIT_FLAG=false
  fi
 
  cat >> "$PS_FILE" <<EOF

  <fieldPermissions>
    <field>${FF}</field>
    <readable>${READ_FLAG}</readable>
    <editable>${EDIT_FLAG}</editable>
  </fieldPermissions>
EOF
done

echo "</PermissionSet>" >> "$PS_FILE"

# 2. Deploy the Permission Set metadata
echo "🛠 Deploying Permission Set '$API_NAME'..."
cd mywork
sf project deploy start -o "$ORG" -d "$PS_FOLDER" $JSON_FLAG

# 3. Assign it to users, if provided
if [[ ${#USERS[@]:-0} -gt 0 ]]; then
  echo "🔐 Assigning Permission Set to users..."
  CMD=(sf org assign permset --target-org "$ORG" --name "$API_NAME")
  for U in "${USERS[@]}"; do
    CMD+=(--on-behalf-of "$U")
  done
  "${CMD[@]}" $JSON_FLAG
fi

echo "🎉 Done! Permission Set '$API_NAME' created, configured, and assigned."
