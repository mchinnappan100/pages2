# Salesforce Authentication Guide

## OAuth PKCE Web Flow
The recommended login method for interactive CLI use.
```
sf-rust org login web -o dev1 --instance-url https://login.salesforce.com
sfr org login web -o myorg --instance-url https://test.salesforce.com
```
Opens a browser window. After login, the CLI captures the token via a local
redirect server on port 1717 at the /OauthRedirect path.

## JWT Bearer Flow (CI/CD)
For automated pipelines and server-to-server auth. No browser required.
Requires a connected app with a certificate uploaded to Salesforce.
```
sf-rust org login jwt -o prod --client-id <CONSUMER_KEY> \
  --jwt-key-file server.key --username user@example.com
```

## Device Flow
For headless environments where a browser cannot be opened on the same machine.
Displays a code and URL — user visits the URL on any device to approve.

## Credential storage
All tokens are stored AES-256-GCM encrypted in:
  ~/.sf-rust/credentials.json   (chmod 600)
  ~/.sf-rust/.key               (32-byte AES key, chmod 600)

## Token refresh
On HTTP 401, sf-rust automatically retries with a refreshed access token
by POSTing grant_type=refresh_token to {instance_url}/services/oauth2/token.

## Show current org info
```
sfr org display -o dev1
sfr org list
sfr org auth show-access-token -o dev1
```

## Logout
```
sfr org logout -o dev1
```
