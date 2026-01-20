**No, Copado does not primarily use the `main` branch (or `master`) for day-to-day **development** work.**

Copado follows a unique, environment-branch-aligned branching strategy (often called the **"Environment = Branch"** or **"Protected Branch Model"** popularized by Copado), which is quite different from modern trunk-based or GitHub Flow approaches.

### Key Points of Copado's Default Branching Strategy (2025–2026)

- **Main/Master branch** → Represents **Production** (the stable, production-ready state).  
  It is the **long-lived stable branch** containing what is currently in (or should be in) production. Feature branches are **created from main** to ensure they start from a clean, production-like baseline (no unfinished work from other features).

- **Development happens in**:
  - **Feature branches** — Automatically created by Copado from the **main** branch when you commit changes on a User Story.  
    These are short-lived (per user story) and collect all commits for that story.
  - Developers work in **developer sandboxes** → commit → feature branch gets created/updated from main → merged forward via promotions.

- **Environment-specific branches** (common setup):
  - `main` / `master` → Production
  - `uat` / `qa` → UAT or QA sandbox
  - `dev` / `integration` → Development or integration sandbox
  - Each Salesforce org/environment is tied to its own dedicated long-lived branch.

- **How promotion works**:
  - When promoting user stories → Copado creates a temporary **promotion branch** (release branch) from the **destination branch** (e.g., from `uat` when promoting to UAT).
  - Feature branches are merged into this promotion branch for validation/conflict resolution.
  - Once successful → deployed to the target org and merged into the target branch.

- **Result**:
  Developers **do not develop directly in `main`** — that would be considered bad practice in Copado.  
  `main` stays clean and production-aligned.  
  Daily development occurs in **feature branches** branched from `main`, then promoted and merged upstream through the pipeline.

### Quick Comparison Table

| Aspect                     | Copado Default Strategy                  | Modern Best Practice (Trunk-based / GitHub Flow) |
|----------------------------|------------------------------------------|--------------------------------------------------|
| Main branch role           | Production (stable, no WIP)              | Development + production-ready                   |
| Where development happens  | Feature branches from main               | Short-lived feature branches from main           |
| Long-lived dev branch?     | No — environment branches + main         | Usually no (main is the only long-lived)         |
| Feature branch base        | Always main (production baseline)        | Main                                             |
| Best for                   | Complex pipelines, multiple envs, compliance | Fast, frequent releases, smaller teams           |

### Summary (2025–2026 perspective)

Copado's model is intentionally more structured and "environment-aware" — great for larger teams, regulated industries, or complex multi-sandbox pipelines, but it can feel rigid compared to pure trunk-based development.

**Developers do not use `main` for development** — they use feature branches created from it.  
`main` is reserved as the **production source of truth**, and changes flow **up** the pipeline (dev → uat → prod), with regular **back-promotions** to keep lower environments in sync.

If your team wants a more modern, streamlined flow (feature branches → direct to main → deploy to staging/prod), many teams today layer tools like Gearset, Salto, or even Copado with custom adjustments on top of trunk-based/GitHub Flow — but that's **not** the out-of-the-box Copado behavior. 😊