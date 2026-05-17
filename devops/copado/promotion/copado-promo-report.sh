#!/usr/bin/env bash

set -euo pipefail

usage() {
  echo "Usage: $0 -p <promotion-name> -o <org-alias>"
  echo
  echo "Example:"
  echo "  $0 -p P13069 -o uat-org"
  exit 1
}

PROMOTION=""
ORG=""

while getopts "p:o:" opt; do
  case ${opt} in
    p ) PROMOTION="$OPTARG" ;;
    o ) ORG="$OPTARG" ;;
    * ) usage ;;
  esac
done

[[ -z "$PROMOTION" || -z "$ORG" ]] && usage

QUERY_FILE=$(mktemp /tmp/copado-query.XXXX.soql)

cat > "$QUERY_FILE" <<EOF
SELECT
    Jira_Key__c,
    Name,
    Description__c,
    copado__Platform__c,
    copado__Sprint__r.Name,
    copado__Project__r.Name,
    copado__Team__r.Name,
    copado__Org_Credential__r.Name,
    copado__Last_Validation_Promotion__r.Name,
    copado__Apex_Code_Coverage__c,
    copado__Apex_Tests_Passed__c,
    copado__Validate_Only__c
FROM copado__User_Story__c
WHERE copado__Last_Validation_Promotion__r.Name = '$PROMOTION'
EOF

echo "Running query for Promotion: $PROMOTION"
echo "Org: $ORG"
echo

sf data query \
    -f "$QUERY_FILE" \
    -o "$ORG" \
    -r csv | csv-to-datatable

rm -f "$QUERY_FILE"