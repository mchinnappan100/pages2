(
  echo -e "Class\tMethod\tLine\tMessage"
  jq -r '
    .result.tests[]
    | select(.Outcome=="Fail")
    | {
        Class: .ApexClass.Name,
        Method: .MethodName,
        Line: (.StackTrace // "NoStackTrace" | capture("line (?<num>[0-9]+)") | .num // "N/A"),
        Message: (.Message // "NoMessage")
      }
    | "\(.Class)\t\(.Method)\t\(.Line)\t\(.Message)"
  ' $1
) | column -t -s $'\t'
