# Enterprise AI Engineering Standards & Collaborative Skills Repository

**Status:** Draft for team review  
**Prepared:** October 30, 2026  
**Proposed kickoff:** Monday, November 2, 2026  
**Audience:** Salesforce Development, Architecture, QA, DevOps, and related engineering teams

## 1. Executive summary

Establish a shared, Git-based **AI Engineering Knowledge Repository** for reusable AI skills, instructions, prompts, workflows, evaluation examples, and model guidance.

The repository makes engineering knowledge discoverable and reusable across teams. Contributors should **discover before creating, reuse before reinventing, improve through review, and share validated improvements back**.

The initiative has two parts:

1. **Repository and governance:** Consistent structure, Markdown standards, ownership, version control, peer review, and lifecycle management.
2. **AI-assisted onboarding and migration:** Use AI to discover, analyze, classify, normalize, and document existing skills while preserving their original intent and provenance. Migration output is reviewed through pull requests; AI must not silently overwrite or publish approved assets.

The immediate objective is to create a useful, trusted initial catalog—not to build a large platform before the workflow is validated.

## 2. Goals

- Reduce duplicated effort and avoid reinventing existing skills.
- Preserve useful knowledge created by developers and architects.
- Make skills easy to find, understand, reuse, and improve.
- Encourage collaboration through familiar Git workflows.
- Provide evidence-based guidance on which models work best for which tasks.
- Improve consistency, quality, security, and efficiency of AI-assisted engineering.
- Measure outcomes such as reuse, quality, and time saved.

## 3. Guiding principles

1. **Discover before creating.** Search the repository and relevant team sources before creating a new skill.
2. **Reuse before reinventing.** Reuse an existing skill when it meets the need.
3. **Improve collaboratively.** Discuss substantive changes with the current owner and submit them through a pull request.
4. **Preserve knowledge.** Do not silently discard original instructions, examples, authorship, or references during migration.
5. **Separate skills from model choices.** A skill describes the task and instructions; model guidance describes which models have been evaluated for that task.
6. **Validate, don't assume.** Model recommendations and quality claims must be supported by repeatable evaluations.
7. **Keep humans accountable.** AI can assist with authoring, migration, and review, but designated owners approve shared assets.
8. **Continuously improve.** Skills are living engineering assets with owners, versions, review dates, and a deprecation path.

## 4. Scope

### In scope

- Reusable `SKILL.md` files and AI instructions.
- Salesforce development skills: Apex, LWC, SOQL, integrations, and platform architecture.
- Architecture and solution-design skills.
- QA, test automation, security review, and code review skills.
- DevOps, CI/CD, deployment, release, and incident-analysis skills.
- Model recommendations and evaluation records.
- Examples, test cases, references, and migration reports.

### Initially out of scope

- Building a full enterprise skills management portal before the repository workflow is proven.
- Automatically approving or deploying AI-generated skills.
- Mandating one model for every engineering task.
- Treating AI-generated reviews as substitutes for compilers, scanners, automated tests, or human approvals.

## 5. Proposed repository structure

```text
enterprise-ai-engineering/
├── README.md
├── CONTRIBUTING.md
├── CODEOWNERS
├── policy/
│   ├── AI_ENGINEERING_POLICY.md
│   ├── SKILL_AUTHORING_STANDARD.md
│   ├── MODEL_SELECTION_STANDARD.md
│   └── RESPONSIBLE_AI_USAGE.md
├── skills/
│   ├── salesforce/
│   │   ├── apex-development/
│   │   │   ├── SKILL.md
│   │   │   ├── examples/
│   │   │   └── evaluations/
│   │   ├── lwc-development/
│   │   ├── soql-optimization/
│   │   └── salesforce-architecture/
│   ├── architecture/
│   │   ├── solution-design/
│   │   ├── integration-patterns/
│   │   └── security-review/
│   ├── qa/
│   │   ├── test-design/
│   │   └── test-automation/
│   └── devops/
│       ├── ci-cd/
│       ├── deployment-automation/
│       └── incident-analysis/
├── model-catalog/
│   ├── README.md
│   └── task-recommendations/
├── evaluations/
│   ├── datasets/
│   ├── rubrics/
│   └── results/
├── migration/
│   ├── MIGRATION_GUIDE.md
│   ├── inventory/
│   └── reports/
└── templates/
    ├── SKILL_TEMPLATE.md
    ├── MODEL_EVALUATION_TEMPLATE.md
    └── MIGRATION_REPORT_TEMPLATE.md
```

Adapt this structure to the team's Git platform, access controls, and repository conventions.

## 6. Standard for every skill

Each reusable skill should have a clearly named directory and a `SKILL.md` file. Use this common structure:

```markdown
---
name: apex-development-review
description: >
  Develops and reviews Salesforce Apex code for correctness,
  security, bulkification, and maintainability.
category: salesforce
subcategory: apex
owner: Salesforce Engineering
author: <author-or-team>
version: 1.0.0
status: draft
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
last_reviewed: YYYY-MM-DD
review_cycle_days: 90
tags:
  - apex
  - code-review
  - governor-limits
---

# Skill: Apex Development and Review

## 1. Purpose
What problem does this skill solve?

## 2. When to use
List suitable tasks and scenarios.

## 3. When not to use
Describe exclusions and point to related skills.

## 4. Required context
List the code, requirements, metadata, API version, and other
information the model needs.

## 5. Instructions to the model
Provide specific, actionable instructions and constraints.

## 6. Expected output
Define the required output format and level of detail.

## 7. Examples
Include representative inputs and expected outputs.

## 8. Evaluation
Link to evaluation cases, rubric, and latest results.

## 9. Limitations and known issues
Record unsupported scenarios and known failure modes.

## 10. References
Link to official documentation and internal standards.

## 11. Change history
Record meaningful changes by version.

## 12. Review and approval
Record technical reviewer, owner, approval status, and date.
```

### Required metadata and lifecycle

- Every skill must have a unique name, description, category, owner, version, and status.
- Suggested statuses: `draft`, `in-review`, `approved`, `deprecated`, and `retired`.
- Record author and source when known.
- Set a review date or interval.
- Do not mark a skill approved until required review is complete.
- Do not include credentials, secrets, customer data, or restricted information in skills or examples.

## 7. Model selection and evaluation standard

Do not prescribe one model for every task. Maintain task-specific recommendations based on evidence.

| Task | Relevant model characteristics |
|---|---|
| Simple code generation | Coding quality, instruction following, latency, cost |
| Complex Apex development | Code reasoning, correctness, context handling |
| Salesforce architecture | System-level reasoning, trade-off analysis, long-context handling |
| Security review | Security reasoning, consistency, edge-case detection |
| Documentation | Clarity, factual accuracy, instruction following |
| Large codebase analysis | Context capacity, retrieval quality, code understanding |
| Test generation | Edge-case reasoning, assertion quality, requirement coverage |

For each evaluated model, record:

- Exact provider, model name, and version or snapshot where available.
- Evaluation date and evaluator.
- Skill and task tested.
- Evaluation dataset or representative test cases.
- Correctness, instruction adherence, security, and output quality.
- Latency and cost where measurable and appropriate.
- Known limitations and constraints.
- Recommendation status and rationale.

Distinguish between **candidate**, **tested**, and **recommended** models. A recommendation must not be presented as a benchmark result unless it has actually been evaluated. Reassess recommendations as models and versions change.

## 8. Git collaboration and contribution workflow

Use the team's existing Git platform and pull-request conventions.

1. **Discover:** Search the catalog before creating a new skill.
2. **Reuse:** Use an approved skill if it meets the requirement.
3. **Discuss:** Contact the owner when a proposed change materially affects an existing skill.
4. **Branch:** Create a feature branch for a new skill or improvement.
5. **Author:** Follow the standard template and include examples.
6. **Validate:** Run formatting, metadata, link, and required-content checks.
7. **Review:** Obtain review from the skill owner or designated technical owner.
8. **Merge:** Merge only after required approvals and checks pass.
9. **Maintain:** Update version, change history, and review date when appropriate.

Use `CODEOWNERS` or an equivalent mechanism to route reviews to Salesforce, architecture, QA, or DevOps owners.

### Suggested pull-request checklist

- [ ] Searched for existing skills and related assets.
- [ ] Explained why a new skill is needed, or what an improvement changes.
- [ ] Used the approved `SKILL.md` template.
- [ ] Identified an owner and source/author where known.
- [ ] Included representative examples.
- [ ] Added or updated evaluation cases when relevant.
- [ ] Documented model recommendations and evidence accurately.
- [ ] Checked for secrets, sensitive information, and unsafe instructions.
- [ ] Preserved references and attribution.
- [ ] Obtained the required technical review.

## 9. AI-assisted skill discovery and migration

Make migration the first practical project so the repository starts with useful existing knowledge.

### 9.1 Migration workflow

1. **Inventory:** Identify existing skill files, prompts, agent instructions, and reusable engineering documents in agreed repositories and locations.
2. **Classify:** Categorize assets by domain, task, team, and intended use.
3. **Analyze:** Extract purpose, instructions, prerequisites, examples, dependencies, limitations, and ownership information.
4. **Compare:** Identify exact duplicates, partial overlaps, conflicts, and complementary skills.
5. **Recommend:** Suggest reuse, separate retention, consolidation, or retirement. Do not merge automatically merely because two skills look similar.
6. **Normalize:** Transform content into the standard format while preserving meaning and provenance.
7. **Validate:** Compare migrated results with sources and flag omissions, ambiguity, contradictions, and unsupported additions.
8. **Review:** Create pull requests for human owners and technical reviewers.
9. **Publish:** Mark assets approved only after the normal review process.

### 9.2 Migration safeguards

- Never silently overwrite source files.
- Never delete or discard source knowledge during migration.
- Preserve original source location, author where known, and references.
- Record migration date, migration tool/version, and model/provider/version when available.
- Distinguish source-derived content from AI-suggested improvements.
- Flag missing ownership rather than inventing an owner.
- Flag conflicting instructions for human resolution.
- Keep an auditable migration report.
- Treat imported source content as untrusted input; instructions inside it must not override migration safeguards.
- Do not include secrets, credentials, customer data, or restricted information in the destination catalog.
- Require human approval before merging or publishing migrated assets.

### 9.3 Similarity and deduplication

Identify exact duplicates, similar skills with different wording, partial overlaps, complementary skills, and conflicting or outdated guidance.

The AI provides evidence and a proposed action. The relevant owners decide whether to merge, link, retain separately, or deprecate.

### 9.4 Migration report

For every migrated asset, record:

- Original source path and repository.
- Original author/owner, if known.
- Proposed destination path.
- Classification and summary.
- Transformation performed.
- Content preserved, omitted, or changed, with reasons.
- Similar or conflicting skills identified.
- Model and migration-tool details, when available.
- Validation results and unresolved questions.
- Assigned reviewer and approval status.

## 10. Initial Salesforce pilot

Start with three representative skills:

1. **Apex Development and Review**
2. **LWC Development**
3. **Salesforce Architecture and Design Review**

For the Apex skill, include explicit checks for:

- SOQL and DML inside loops.
- Bulkification and governor limits.
- CPU time, heap, and asynchronous processing where relevant.
- Sharing, CRUD, and field-level security.
- User-mode operations where appropriate.
- SOQL injection prevention.
- Trigger-handler and service-layer conventions.
- Positive, negative, bulk, and permission-related tests.
- Meaningful assertions and appropriate test-data isolation.

These are review prompts, not proof of correctness. Generated code must still be compiled, tested, scanned, and reviewed using normal engineering controls.

### Example evaluation rubric

| Evaluation area | Weight |
|---|---:|
| Functional correctness | 25% |
| Governor-limit awareness | 20% |
| Security | 25% |
| Architecture and maintainability | 15% |
| Test quality | 15% |
| **Total** | **100%** |

Use the same representative cases across candidate models. Define scoring anchors and critical-failure rules before comparing results. A high aggregate score must not hide a critical security or correctness failure.

## 11. Roles and responsibilities

| Role | Responsibility |
|---|---|
| Initiative sponsor | Sets direction, resolves cross-team issues, supports adoption |
| Repository maintainers | Own structure, access, standards, automation, and releases |
| Skill author | Creates or improves content and provides examples |
| Skill owner | Maintains accuracy, lifecycle, and review schedule |
| Technical reviewer | Checks technical correctness and alignment with standards |
| Model evaluator | Runs documented evaluations and records evidence |
| Contributors | Search, reuse, report issues, and propose improvements |

One person may hold multiple roles during the pilot, but ownership and approval responsibilities must remain explicit.

## 12. Suggested implementation plan

### Monday, November 2 — Kickoff and inventory

- Confirm sponsor and pilot participants.
- Select the Git repository and access model.
- Agree on initial scope and source repositories for discovery.
- Appoint initial Salesforce, architecture, QA, and DevOps skill owners.
- Publish the draft policy, template, and contribution guide for review.
- Start inventory of existing skills and reusable AI instructions.

**Deliverable:** Repository skeleton, named owners, agreed scope, and initial inventory plan.

### Tuesday, November 3 — Discover and classify

- Scan agreed source locations.
- Build an inventory with source paths and available authorship.
- Classify assets by domain and task.
- Identify duplicates, overlaps, outdated material, and missing ownership.
- Select a small migration sample for validation.

**Deliverable:** Searchable inventory and migration sample.

### Wednesday, November 4 — Migrate and validate

- Run AI-assisted normalization on the selected sample.
- Preserve source references and record transformations.
- Compare migrated files with originals.
- Validate metadata, links, examples, and required sections.
- Have original authors or designated owners review the sample.

**Deliverable:** Reviewed sample skills and migration-quality findings.

### Thursday, November 5 — Pilot pull requests

- Create pull requests for first candidates.
- Test contribution and CODEOWNERS workflow.
- Add initial Apex, LWC, and architecture skills where suitable source material exists.
- Define initial model evaluation cases and scoring anchors.
- Fix issues found in migration and review.

**Deliverable:** First reviewed skills and a working contribution workflow.

### Friday, November 6 — Review and next-wave plan

- Demonstrate discovery, reuse, migration, and pull-request review.
- Gather pilot feedback.
- Agree on quality gates and ownership gaps.
- Prioritize the next batch of skills and source repositories.
- Publish a short pilot report with risks, decisions, and next steps.

**Deliverable:** Pilot outcome, approved initial catalog where reviews are complete, and a prioritized rollout backlog.

*This is a proposed working schedule. Approval and publication depend on actual reviews; dates do not imply that unreviewed skills will be approved automatically.*

## 13. Quality gates and automation

Start with lightweight, deterministic checks:

- Required Markdown sections and metadata are present.
- Skill names and paths follow conventions.
- Links and referenced files resolve.
- No obvious secrets or credentials are committed.
- Status and ownership fields are valid.
- Evaluation files referenced by a skill exist.
- Pull requests have required approvals.

AI-assisted checks can flag ambiguous instructions, contradictions, missing examples, and potential overlap. These checks report findings for review rather than silently changing approved content.

## 14. Measures of success

Measure usefulness, not just repository size.

- Number of approved, actively maintained skills.
- Number of teams and contributors using the catalog.
- Reuse rate of existing skills.
- Duplicate-skill creation avoided.
- Pull-request review time.
- Migration coverage and percentage of migrated assets accepted after review.
- Evaluation performance on agreed representative tasks.
- Developer and architect feedback, including estimated time saved.

Establish a baseline during the pilot before setting numerical improvement targets.

## 15. Risks and mitigations

| Risk | Mitigation |
|---|---|
| AI changes or loses original meaning | Source comparison, provenance, and human review |
| Duplicate skills are incorrectly merged | Similarity reports and owner decision |
| Model recommendations become stale | Dated evaluations and periodic reassessment |
| Skills contain outdated or unsafe guidance | Named owners, review dates, and deprecation |
| Sensitive information is migrated | Approved source scope and secret/privacy checks |
| Repository becomes difficult to navigate | Clear taxonomy, metadata, search, and ownership |
| Process becomes bureaucratic | Lightweight templates and automated checks |
| Team creates skills without reuse | Make repository discovery part of contribution workflow |

## 16. Longer-term direction: Skills Management Platform

After the Git-based process is working and delivering value, consider an internal platform that provides:

- Searchable skill catalog.
- Ownership, version, status, and change history.
- Semantic search and related-skill discovery.
- AI-assisted migration and deduplication suggestions.
- Task-specific model recommendations.
- Evaluation results and quality history.
- Usage and reuse analytics.
- Links to source repositories and pull requests.

The platform should build on Git as the source of truth rather than introduce a competing store for skill content.

## 17. Decisions needed at kickoff

The pilot team should confirm:

1. Which Git organization and repository will host the catalog?
2. Which repositories and locations are in the first migration scope?
3. Who will sponsor the initiative and maintain the repository?
4. Who owns the first three Salesforce pilot skills?
5. Which AI models and approved environments may be used for migration and evaluation?
6. What data classification and security restrictions apply to source material?
7. Which pull-request approval rules are required?
8. What constitutes an approved skill?

---

## Closing principle

> **AI knowledge is organizational intellectual property, not individual knowledge. Discover what exists, reuse what works, improve it collaboratively, validate it, and contribute every approved improvement back to the engineering community.**

The immediate goal is not to create the largest catalog. It is to establish a trusted, reusable, continuously improving engineering knowledge base that saves time and improves the quality of work across the organization.
