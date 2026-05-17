#!/usr/bin/env bash

set -euo pipefail

usage() {
    echo "Usage: $0 -k <keyword> -o <org-alias>"
    echo
    echo "Example:"
    echo "  $0 -k SFT -o uat-org"
    exit 1
}

KEYWORD=""
ORG=""

while getopts "k:o:" opt; do
    case ${opt} in
        k) KEYWORD="$OPTARG" ;;
        o) ORG="$OPTARG" ;;
        *) usage ;;
    esac
done

[[ -z "$KEYWORD" || -z "$ORG" ]] && usage

QUERY_FILE=$(mktemp /tmp/copado-title-query.XXXX.soql)

cat > "$QUERY_FILE" <<EOF
SELECT
    copado__User_Story_Title__c,
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

    copado__Validate_Only__c,
    copado__Base_Branch__c,
    copado__View_in_Git__c,

    copado__Environment__r.Name,
    copado__Environment_Type__c,

    copado__Manual_Step_Required__c,
    LastModifiedBy.Name,
    copado__Has_Apex_Code__c

FROM copado__User_Story__c
WHERE copado__User_Story_Title__c LIKE '%$KEYWORD%'
EOF

echo "Searching User Stories"
echo "Keyword : $KEYWORD"
echo "Org     : $ORG"
echo

sf data query \
    -f "$QUERY_FILE" \
    -o "$ORG" \
    -r csv | csv-to-datatable

rm -f "$QUERY_FILE"