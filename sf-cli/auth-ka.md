# Knowledge Article: Prevent Salesforce CLI from Attempting Login to Deactivated Users

## Overview

When you execute the Salesforce CLI command `sf org list`, the CLI displays the Salesforce orgs for which the current user has stored authentication information.

The command also attempts to validate connectivity to these orgs and reports their connection status. If a user has been deactivated in a Salesforce org but their authentication information remains stored locally, the CLI may still attempt to connect to that org using the user's saved credentials.

These login attempts may appear in Salesforce login or security logs, even though the user is no longer active in the org.

**Recommended solution:** Remove the obsolete authentication entry using `sf org logout -o <username>`.

## 1. Understanding the `sf org list` Command

Run the following command to list the Salesforce orgs configured in your local Salesforce CLI environment:

```
sf org list
```

The output typically includes columns such as:

| Column   | Description                                                           |
| -------- | --------------------------------------------------------------------- |
| Type     | Type of org, such as DevHub, sandbox, or production                   |
| Alias    | Locally configured alias for the org                                  |
| Username | Salesforce username associated with the authentication                |
| Org ID   | Salesforce organization identifier                                    |
| Status   | Indicates the connection or authentication status reported by the CLI |

The CLI uses locally stored authentication information to identify the orgs to display. During status checks, it may attempt to connect to the orgs using the saved authentication information.

## 2. Problem Scenario

Consider the following situation:

1. A user previously logged in to a Salesforce org using `sf org login`.
2. The Salesforce administrator subsequently deactivates the user's account in that org.
3. The user's authentication information remains stored in the local Salesforce CLI environment.
4. The user runs `sf org list`.
5. The CLI attempts to check connectivity to the previously authenticated org.
6. Salesforce logs may record a login or authentication attempt associated with the deactivated user's username.

This can create unnecessary authentication activity in Salesforce logs and may cause confusion during security reviews or login-log investigations.

**Important:** Deactivating a Salesforce user does not automatically remove that user's locally stored Salesforce CLI authentication information.

## 3. Recommended Resolution

Use the following command to remove the saved authentication information for the deactivated user:

```
sf org logout -o <username>
```

Replace `<username>` with the Salesforce username associated with the deactivated account.

### Example

Suppose the deactivated user's Salesforce username is:

```
former.user@example.com
```

Execute:

```
sf org logout -o former.user@example.com
```

This removes the corresponding authentication entry from the local Salesforce CLI environment.

If the org was configured using an alias, you can also use the applicable alias to identify the target org, provided it resolves to the intended authentication entry.

## 4. Verify the Resolution

After logging out the obsolete authentication entry, execute:

```
sf org list
```

Verify that the deactivated user's org authentication entry is no longer listed and that the CLI no longer attempts to validate that org through the removed entry.

If the same username is authenticated separately in another org or through another local CLI environment, verify those entries independently.

## 5. Best Practices

- **Clean up obsolete authentication:** Remove saved CLI authentication entries when a user no longer needs access to an org.
- **Perform cleanup after deactivation:** Include local Salesforce CLI authentication cleanup in developer workstation and access-removal procedures where applicable.
- **Use explicit usernames or aliases:** Ensure the logout command targets the intended authentication entry.
- **Review login logs:** If unexpected login attempts continue, investigate other CLI sessions, scripts, automation jobs, and authentication mechanisms.
- **Do not rely on local logout for access control:** Deactivating the Salesforce user remains the server-side control. Local logout removes the saved CLI authentication entry; it does not replace user deactivation or revoke every possible session or credential.

## 6. Quick Reference

| Action                                     | Command                       |
| ------------------------------------------ | ----------------------------- |
| List configured orgs                       | `sf org list`                 |
| Remove saved authentication for a username | `sf org logout -o <username>` |
| Recheck the configured org list            | `sf org list`                 |

## Summary

When a Salesforce user is deactivated, previously stored Salesforce CLI authentication information may remain on the user's machine. Running `sf org list` can trigger connectivity checks that result in authentication activity against the org.

To prevent unnecessary attempts through an obsolete local authentication entry, execute:

```
sf org logout -o <username>
```

Then rerun `sf org list` to verify the cleanup.

