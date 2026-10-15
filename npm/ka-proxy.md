# Knowledge Article: Troubleshooting Proxy Server Issues When Running npm-Based Applications on Windows

**Category:** Developer Tools / Node.js / npm / Network Connectivity\
**Audience:** Windows users, developers, DevOps, and IT Support\
**Applies to:** Node.js, npm, npm-based CLI tools, and applications that download packages or access external services

## 1. Overview

Windows users may encounter issues when installing, configuring, or running npm-based applications in a corporate network environment. A common cause is the corporate proxy server, which controls access to external internet resources.

Applications may fail to install or start because npm, Node.js, or the application itself cannot connect to external services through the configured proxy.

Typical symptoms include:

- npm commands fail with network or connection errors.
- Package installation hangs or times out.
- Applications fail to download dependencies or updates.
- npm-based CLI tools cannot access external APIs.
- Errors such as `ECONNRESET`, `ETIMEDOUT`, `ECONNREFUSED`, `E407`, or certificate verification failures occur.
- Applications work on a home network but fail on the corporate network.
- The application works on macOS but encounters proxy-related problems on Windows.

## 2. Common Error Messages

| Error                               | Possible cause                                                          |
| ----------------------------------- | ----------------------------------------------------------------------- |
| `ECONNRESET`                        | Connection reset by a proxy, firewall, or remote server                 |
| `ETIMEDOUT`                         | Proxy or destination is unreachable, or a connection is taking too long |
| `ECONNREFUSED`                      | Proxy address or port is incorrect, or the service is unavailable       |
| `407 Proxy Authentication Required` | Proxy authentication is required or credentials are invalid             |
| `SELF_SIGNED_CERT_IN_CHAIN`         | Certificate chain is not trusted, possibly due to TLS inspection        |
| `UNABLE_TO_VERIFY_LEAF_SIGNATURE`   | Node.js cannot validate the server's certificate chain                  |
| `ENOTFOUND`                         | DNS resolution failure, potentially involving the proxy hostname        |
| `EAI_AGAIN`                         | Temporary DNS resolution failure                                        |

**Important:** These errors can have causes other than proxy configuration. Verify the network path and error details before changing settings.

## 3. Troubleshooting Steps

### Step 1: Verify Node.js and npm

Open PowerShell or Command Prompt and run:

```
node --version
npm --version
where.exe node
where.exe npm
```

Confirm that Node.js and npm are installed and that the expected executables are being used.

If multiple Node.js installations exist, the wrong installation may be taking precedence in the `PATH` environment variable.

### Step 2: Check the current npm proxy configuration

Run:

```
npm config get proxy
npm config get https-proxy
npm config get registry
npm config list
```

Check whether a proxy is configured and whether the registry points to the expected npm registry or corporate registry.

The default public npm registry is:

```
https://registry.npmjs.org/
```

A corporate environment may require an internal registry or an approved proxy instead.

### Step 3: Inspect proxy environment variables

In PowerShell, run:

```
Get-ChildItem Env: |
    Where-Object { $_.Name -match 'PROXY|NODE_EXTRA_CA_CERTS' }
```

In Command Prompt, run:

```
set HTTP_PROXY
set HTTPS_PROXY
set NO_PROXY
set NODE_EXTRA_CA_CERTS
```

Look for variables such as:

- `HTTP_PROXY`
- `HTTPS_PROXY`
- `ALL_PROXY`
- `NO_PROXY`
- `NODE_EXTRA_CA_CERTS`

An incorrect proxy address, stale configuration, or conflicting environment variables may cause failures.

Do not share command output publicly if it contains credentials or sensitive internal hostnames.

### Step 4: Verify corporate proxy requirements

If the company requires a proxy, obtain the approved proxy configuration from IT or Network Support.

Confirm:

- The correct proxy hostname and port.
- Whether proxy authentication is required.
- Whether the proxy performs TLS/HTTPS inspection.
- Whether the npm registry is accessible through the proxy.
- Whether a corporate certificate authority must be trusted by Node.js.
- Whether the application needs access to additional external APIs beyond the npm registry.

Do not guess the proxy address or use an unapproved external proxy.

### Step 5: Configure npm when a proxy is required

If IT provides an HTTP proxy endpoint, configure npm using the approved value:

```
npm config set proxy http://proxy.example.com:8080
npm config set https-proxy http://proxy.example.com:8080
```

Replace the example hostname and port with the actual corporate configuration.

An HTTP proxy URL can be used for HTTPS destinations because the client and proxy can establish a tunnel using the HTTP CONNECT method. Use the URL scheme specified by IT; do not assume every proxy endpoint uses the same scheme.

Verify the result:

```
npm config get proxy
npm config get https-proxy
npm ping
```

If IT requires direct access to the registry or a different configuration, follow that policy instead.

### Step 6: Check registry connectivity

Run:

```
npm view npm version
npm ping
```

If these commands fail, investigate npm registry access, DNS, proxy configuration, authentication, and TLS certificates.

If these commands succeed but the application still fails, the problem may be in the application's own network configuration rather than npm.

### Step 7: Handle corporate certificate issues correctly

Some corporate networks inspect HTTPS traffic and re-sign certificates using an internal certificate authority. Node.js may not trust that certificate authority by default.

Ask IT for the approved corporate root CA certificate in PEM format. If permitted, configure Node.js to trust that certificate:

```
$env:NODE_EXTRA_CA_CERTS = "C:\certs\corporate-root-ca.pem"
```

To persist the variable for future sessions:

```
setx NODE_EXTRA_CA_CERTS "C:\certs\corporate-root-ca.pem"
```

Open a new terminal after using `setx`.

Ensure that the certificate file comes from a trusted IT source and contains the appropriate CA certificate. The variable extends Node.js's trusted certificate set; it does not fix every certificate or proxy issue.

**Security warning:** Do not use `npm config set strict-ssl false` or `NODE_TLS_REJECT_UNAUTHORIZED=0` as a workaround. Disabling certificate validation exposes connections to interception and other security risks.

### Step 8: Check application-specific proxy support

Successful npm installation does not guarantee that the application can communicate through the corporate proxy.

An application may use Node.js `fetch`, a third-party HTTP library, WebSockets, or another networking implementation. Each may have different proxy support depending on the Node.js version and application configuration.

Check:

- Whether the application supports corporate proxies.
- Whether its HTTP client supports the required proxy type and authentication method.
- Whether `HTTP_PROXY` and `HTTPS_PROXY` are honored by that client.
- Whether WebSocket connections are supported through the corporate proxy.
- Whether external API destinations are permitted by network policy.

For example, an npm-based application may install successfully but fail when it tries to contact an AI service, download a model, or connect to an external API.

### Step 9: Check `NO_PROXY` settings

`NO_PROXY` identifies hosts that should bypass the proxy when supported by the networking client.

For example:

```
$env:NO_PROXY = "localhost,127.0.0.1"
```

This can be useful for local application services.

However, syntax and wildcard behavior vary between clients. Avoid placing all external hosts in `NO_PROXY`, as that may cause corporate network access to fail.

### Step 10: Retry the application

After correcting the configuration:

1. Close the existing terminal.
2. Open a new PowerShell session.
3. Verify Node.js and npm versions.
4. Run `npm ping` or `npm view npm version`.
5. Retry the original npm command or application.
6. Capture the complete error output if the problem persists.

For an application installed globally, verify its location with:

```
npm ls -g --depth=0
npm config get prefix
```

If the application is already installed, avoid repeatedly reinstalling it until the network configuration has been checked.

## 4. Quick Diagnostic Checklist

Use this checklist before escalating the issue.

- Node.js and npm are installed correctly.
- The expected Node.js installation is being used.
- npm registry configuration is correct.
- Proxy settings match the corporate IT requirements.
- Proxy authentication is working, if required.
- DNS and network connectivity are functioning.
- Corporate CA certificates are trusted where required.
- TLS certificate verification remains enabled.
- The application's HTTP client supports the required proxy configuration.
- WebSocket and external API connections are permitted.
- The original error message and command output have been captured.

## 5. Information to Include in an IT Support Ticket

When escalating the issue, provide:

- Windows version.
- Node.js and npm versions.
- Application name and version.
- Command that failed.
- Complete error message, with secrets removed.
- Whether npm package installation succeeds.
- Whether `npm ping` succeeds.
- Whether the issue occurs only on the corporate network.
- Whether the application uses external APIs or WebSockets.
- Proxy configuration status, without passwords or authentication tokens.

Example:

**Issue:** npm-based application cannot connect to an external service on Windows.

**Environment:** Windows 11, Node.js and npm installed.

**Observed behavior:** `npm ping` succeeds, but the application fails when connecting to its external API.

**Request:** Please verify the approved proxy configuration, TLS inspection requirements, and network access for the destination service.

## 6. Recommended Practices

- Use the corporate-approved proxy configuration.
- Keep Node.js and npm versions aligned with the application's supported versions.
- Prefer approved internal npm registries where required.
- Use the official corporate CA certificate when TLS inspection is enabled.
- Avoid hardcoding proxy credentials in source code or configuration files committed to Git.
- Do not disable TLS certificate validation.
- Test npm connectivity separately from application connectivity.
- Document Windows-specific proxy requirements for every internally distributed npm-based CLI tool.

## 7. Summary

Proxy issues on Windows can affect both npm package management and application runtime connectivity. The most effective troubleshooting approach is to validate the Node.js installation, inspect npm and environment proxy settings, verify corporate network requirements, and then test the application separately.

If npm works but the application fails, investigate the application's networking implementation, authentication, certificates, and destination-specific access rather than assuming npm itself is broken.

**Escalation path:** Developer → IT/Network Support → Application or Tool Owner.

## Suggested troubleshooting flow

1\. npm command fails on Windows

2\. Check Node.js, npm and proxy settings

npm works

Investigate application-specific HTTP, API, or WebSocket proxy support.

npm fails

Verify proxy address, authentication, registry access, DNS, and certificates.

3\. Apply approved corporate settings and retest

