# REPO_GOVERNANCE.md
Version: 1.0  
Last reviewed: 2026-02-01  
Owner: Repo Maintainers (see CODEOWNERS)  

This document is the single source of truth for how this repository is developed, reviewed, tested, and released. All repository settings, CI workflows, and enforcement automations MUST conform to this document.

---

## 1) Principles

### 1.1 Trunk-based development (TBD)
We use **trunk-based development**:
- **`main` is trunk** and is always releasable.
- Work is integrated via **short-lived branches** and **small PRs**.
- We prefer **incremental delivery** over long-running feature branches.

### 1.2 Small batches, fast feedback
- PRs should be small enough to review in minutes, not hours.
- Use feature flags/config toggles when needed to keep `main` releasable.

### 1.3 Quality gates are non-negotiable
- CI must be deterministic and reproducible.
- Security checks must fail closed.
- “Works on my machine” is treated as a defect in tooling.

---

## 2) Branching Strategy

### 2.1 Protected branches
- **`main`**: trunk; always releasable.
- **`develop`**: optional stabilization branch **only when needed** (see §2.4).  
  If used, it is protected the same as `main`.

### 2.2 Allowed branch types
Short-lived branches only:
- `feat/<slug>` for user-facing changes
- `fix/<slug>` for bug fixes
- `chore/<slug>` for tooling/refactors
- `sec/<slug>` for security-related changes

### 2.3 Lifetime rules
- Branches should live **hours to a few days**, not weeks.
- Rebase/merge frequently to reduce drift.

### 2.4 When `develop` is allowed
Default is **no `develop`** (pure TBD).  
`develop` may be used temporarily when:
- a demo/release needs stabilization while trunk continues moving, or
- a coordinated multi-PR integration requires a short stabilization window.

When `develop` is used:
- it must be kept close to `main` (merge/rebase at least daily),
- it must not become a long-lived divergence.

---

## 3) Pull Request Policy

### 3.1 Required PR contents
Every PR must include:
- clear description of **what** and **why**
- testing notes: what you ran + results
- any schema/data contract changes called out explicitly
- screenshots/CLI evidence where relevant (especially for frontend/demo flows)

### 3.2 PR size and scope
- One intent per PR.
- If the diff is “hard to review,” split it.

### 3.3 Review requirements
- **CODEOWNERS approvals are required** for files they own.
- At least **one maintainer** must approve.
- No self-approval on PRs that change governance, CI, security, or release pipelines.

### 3.4 Merge strategy
- Prefer **squash merge** to keep history readable.
- Preserve meaningful commit messages inside PR description if needed.

### 3.5 No direct pushes to protected branches
- Direct pushes to `main` (and `develop` if enabled) are forbidden.
- Force-pushes and deletions on protected branches are forbidden.

---

## 4) CI/CD Requirements

### 4.1 Required checks (must match GitHub required status checks exactly)
The following status checks are required on protected branches:
- `lint`
- `typecheck`
- `unit-tests`
- `integration-tests`
- `smoke-sim`
- `governance-audit`

These check names MUST be stable. Renaming requires updating:
1) this document,
2) workflows,
3) branch protection settings,
in the same PR.

### 4.2 Minimum pipeline semantics
- Fail fast: if upstream quality gates fail, downstream jobs must not proceed.
- Deterministic runs: no reliance on wall-clock time, random IDs, or nondeterministic ordering in tests.
- Node versions: support Node 20 LTS (and optionally Node 18 if required by dependencies), as defined by the CI workflow.

### 4.3 Security hygiene baseline
At minimum, CI must include:
- dependency vulnerability check (production scope)
- secret scanning (e.g., gitleaks)
- least-privilege workflow permissions (`contents: read` by default)

### 4.4 Release safety
- Production deployments (if/when added) must only trigger from trusted refs (e.g., `main` tags).
- No deployments from `pull_request` events.

---

## 5) Branch Protection Rules (Enforcement)

Protected branches (`main`, and `develop` if enabled) MUST enforce:

1) **Required status checks**
- Require the exact checks listed in §4.1.

2) **Required reviews**
- Require PR reviews before merging
- Require CODEOWNERS review
- Require at least one maintainer approval

3) **Admin restrictions**
- Admin bypass is disabled (no override).

4) **History protection**
- Disallow force pushes
- Disallow deletions

---

## 6) CODEOWNERS

CODEOWNERS must exist at repository root as `/CODEOWNERS`.

Ownership entries must be explicit and minimal. Ownership is used to:
- auto-request reviewers
- block merges without required approvals

If CODEOWNERS changes:
- the change must be justified in the PR
- governance-audit must validate the file

---

## 7) Governance Audit (Drift Prevention)

A `governance-audit` job must enforce:
- this governance doc exists and is parseable
- required check names in CI match §4.1
- branch protection configuration matches §5
- CODEOWNERS exists and matches policy constraints

Any drift between:
- repo settings
- CI job names
- CODEOWNERS
- this document  
must fail the audit and block merge.

---

## 8) Trunk-based Delivery Practices

### 8.1 Feature flags / demo toggles
To keep `main` releasable:
- introduce toggles/config switches at the edges (bootstrap/config), not deep in domain logic
- do not add “demo mode skip validation” branches in core logic

### 8.2 Backward-compatible changes
- Prefer additive APIs and schema changes.
- If you must break compatibility, stage it:
  1) add new path/shape
  2) migrate callers
  3) remove old path

### 8.3 Definition of Done (DoD)
A PR is “done” when:
- required checks pass (§4.1)
- deterministic test behavior verified (repeatability)
- docs updated if behavior changed
- demo evidence provided when user-facing flows change

---

## 9) Exceptions

Exceptions are rare and must be documented.
- Any exception to these rules requires a PR comment from a maintainer explaining:
  - what is being bypassed
  - why
  - how it will be corrected
- If a tool cannot enforce a rule, governance-audit should fail and require a fix before merge.

---

## 10) Change Management for Governance

To change governance:
1) Update **REPO_GOVERNANCE.md** first (this file)
2) In the same PR, update:
   - CI workflows
   - branch protection settings
   - CODEOWNERS (if applicable)
3) Governance-audit must pass on the PR

No “tooling first, docs later.” Docs are the contract.
