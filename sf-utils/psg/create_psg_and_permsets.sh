#!/usr/bin/env bash
# Usage example:
# ./create_psg_add_permsets.sh \
#   --psg_dev_name DevTeamGroup \
#   --psg_master "Dev Team Group" \
#   --username myOrgAlias \
#   --permsets "0PSA0000000ABC1,0PSA0000000DEF2"
#   -- delay_ms 5000
# This script creates a Permission Set Group (PSG) in Salesforce and adds specified Permission Sets to it.
# It includes a delay option to wait for the PSG to be updated before adding Permission Sets.
# author: Mohan Chinnappan
#-----------------------------------------------------------

set -euo pipefail

# Default parameters
DELAY_MS=0

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --psg_dev_name) PSG_DEV_NAME="$2"; shift 2;;
    --psg_master) PSG_MASTER_LABEL="$2"; shift 2;;
    --psg_description) PSG_DESCRIPTION="$2"; shift 2;;
    
    --username) ORG_ALIAS="$2"; shift 2;;
    --permsets) IFS=',' read -r -a PERMSET_IDS <<< "${2//\"/}"; shift 2;;
    --delay_ms) DELAY_MS="$2"; shift 2;;
    *) echo "❌ Unknown argument: $1"; exit 1;;
  esac
done

# Validate input
if [[ -z "${PSG_DEV_NAME:-}" || -z "${PSG_MASTER_LABEL:-}" || -z "${ORG_ALIAS:-}" || ${#PERMSET_IDS[@]} -eq 0 ]]; then
  echo "❌ Usage: --psg_dev_name <devName> --psg_master <MasterLabel> \
--username <orgAlias> --permsets \"Id1,Id2,...\""
  exit 1
fi

# 1. Create the Permission Set Group
echo "➡️ Creating Permission Set Group..."
RESP=$(sf data create record \
  -s PermissionSetGroup \
  -v "DeveloperName='$PSG_DEV_NAME' MasterLabel='$PSG_MASTER_LABEL' Description='Description for $PSG_MASTER_LABEL'" \
  -u "$ORG_ALIAS" --json)
PSG_ID=$(echo "$RESP" | jq -r '.result.id')
echo "✅ Created PSG with ID: $PSG_ID"



# 2 Add Permission Sets to the Group
for PS_ID in "${PERMSET_IDS[@]}"; do
  echo "🔗 Linking PermissionSet ID=$PS_ID..."

  # 3. Optional initial delay
    if (( DELAY_MS > 0 )); then
    D_SEC=$(bc <<< "scale=3; $DELAY_MS/1000")
    echo "⏱️ Waiting ${D_SEC}s before polling..."
    sleep "$D_SEC"
    fi

    # 4. Poll until Status == 'Updated'
    echo "⏳ Waiting for PSG to reach 'Updated' status..."
    while true; do
    sleep 3
    STATUS=$(sf data query \
        -q "SELECT Status FROM PermissionSetGroup WHERE Id = '$PSG_ID'" \
        -u "$ORG_ALIAS" --json | jq -r '.result.records[0].Status')
    echo "  • Current Status: $STATUS"
    if [[ "$STATUS" == "Updated" ]]; then
        echo "✅ PSG status is 'Updated' — proceeding to add Permission Sets."
        break
    fi
    done
    sf data create record \
        -s PermissionSetGroupComponent \
        -v "PermissionSetGroupId='$PSG_ID' PermissionSetId='$PS_ID'" \
        -u "$ORG_ALIAS" >/dev/null
    echo "✅ Added $PS_ID"
    done

echo "🎉 All set! Permission Set Group ($PSG_ID) updated with Permission Sets."
