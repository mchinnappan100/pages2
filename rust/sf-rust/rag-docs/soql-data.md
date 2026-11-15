# SOQL Queries and Data Export

## Basic SOQL query
```
sfr data query -q "SELECT Id, Name FROM Account" -o dev1
sfr data query -q "SELECT Id, Name, Industry FROM Account WHERE Industry = 'Technology'" -o dev1
```

## Pagination
Default page size is 50 rows in interactive mode.
```
sfr data query -q "SELECT Id, Name FROM Account" -o dev1 --page-size 25
sfr data query -q "SELECT Id, Name FROM Account" -o dev1 --all
```

## Export formats
```
sfr data query -q "SELECT Id, Name FROM Account" -o dev1 --csv > accounts.csv
sfr data query -q "SELECT Id, Name FROM Account" -o dev1 --json
sfr data query -q "SELECT Id, Name FROM Account" -o dev1 --ndjson
sfr data query -q "SELECT Id, Name FROM Account" -o dev1 --markdown
```

## Binary/file formats
```
sfr data query -q "SELECT Id, Name FROM Account" -o dev1 --parquet accounts.parquet
sfr data query -q "SELECT Id, Name FROM Account" -o dev1 --arrow accounts.arrow
sfr data query -q "SELECT Id, Name FROM Account" -o dev1 --xlsx accounts.xlsx
sfr data query -q "SELECT Id, Name FROM Account" -o dev1 --sqlite sf.db --sqlite-table accounts
```

## Browser datatable
Opens a self-contained HTML page with a sortable, searchable table.
```
sfr data query -q "SELECT Id, Account.Name FROM Contact" -o dev1 --datatable
```
Nested relationship fields like Account.Name are flattened to dot-notation.

## Grep filter
Post-filter results by regex after fetching all records:
```
sfr data query -q "SELECT Id, Name FROM Account" -o dev1 --grep "Tech"
```

## Arrow file viewer
```
sfr data arrow-view accounts.parquet
sfr data arrow-view accounts.parquet --schema
sfr data arrow-view accounts.parquet --xlsx output.xlsx
```

## SQLite REPL (rsql)
Load Salesforce objects into an in-memory SQLite database and run SQL:
```
sfr data rsql -o dev1 --load Account --load Contact
sfr data rsql -o dev1 --load Account --db sf.db
```
