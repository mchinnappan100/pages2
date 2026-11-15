# Apex Code Execution and Testing

## Execute anonymous Apex
Run a .apex script file against an org:
```
sfr apex execute -f scripts/hello.apex -o dev1
sfr apex execute -f scripts/batch-job.apex -o dev1
```

## Run Apex tests
```
sfr apex test -n MyClass_Test -o dev1
sfr apex test -n MyClass_Test,AnotherTest -o dev1
sfr apex test --all -o dev1
```

## View debug logs
```
sfr apex list-logs -o dev1
sfr apex get-log --id <LOG_ID> -o dev1
```

## Apex log profiler (flamegraph)
Analyze execution time hotspots from an Apex debug log:
```
sfr apex log-profile --id <LOG_ID> -o dev1 --flamegraph
```
Opens an interactive flamegraph HTML page showing method call time.

## Example hello.apex script
```apex
System.debug(Hello from sf-rust!);
List<Account> accounts = [SELECT Id, Name FROM Account LIMIT 5];
for (Account a : accounts) {
    System.debug(Account:  + a.Name);
}
```

## Best practices
- Always use bind variables in SOQL to prevent injection: WHERE Id = :recordId
- Use Database.query() only when the query is truly dynamic
- Bulkify triggers — handle collections, not single records
- Use the Unit of Work pattern for DML operations across multiple objects
