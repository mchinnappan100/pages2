# Salesforce Metadata Deployment Guide

## Overview
Metadata deployment pushes Apex classes, triggers, Lightning components, flows,
permission sets, custom objects, and other metadata from your local project to
a Salesforce org.

## Deploy with sf-rust
```
sf-rust metadata deploy -d force-app -o dev1
sfr metadata deploy -d force-app -o dev1
```
The deploy command uses the SOAP Metadata API endpoint.
It packages the directory into a ZIP, uploads it, and polls for completion.

## Retrieve metadata
```
sf-rust metadata retrieve -m ApexClass -o dev1
sfr metadata retrieve -m CustomObject:Account -o dev1
```

## Supported metadata types
- ApexClass, ApexTrigger, ApexPage
- LightningComponentBundle (LWC)
- Flow, FlowDefinition
- CustomObject, CustomField
- PermissionSet, Profile
- ValidationRule, WorkflowRule
- EmailTemplate, StaticResource

## Deployment best practices
- Always deploy to a sandbox before production
- Use --check-only flag for a validation run without committing
- Monitor deployment status with the Setup > Deploy > Deployment Status page
- Use SFDX source format (force-app/main/default/) for best compatibility

## Troubleshooting
If a deployment fails, check the component errors in the response.
Common causes: missing dependencies, Apex test failures, invalid metadata XML.
