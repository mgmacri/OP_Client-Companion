<!-- .github/skills/ci-quality-gates/SKILL.md -->

# ✅ Skill: CI Quality Gates (Node/React/Python/.NET/Docker/Terraform)

> 📌 **Recommended Model: GPT-5.2-Codex**  
> Use this whenever CI/CD pipelines are created or modified.

---

## 🔔 Triggers

- Any workflow that runs on `push` or `pull_request`
- Any change to lint/test/build commands
- Any Docker build or Terraform validation added to CI

---

## ✅ Hard Rules

1. **Core checks for every PR**
   - Install dependencies with lockfile enforced:
     - `pnpm install --frozen-lockfile` in `backend/` and `web/` if they exist.
   - Run:
     - `pnpm lint`
     - `pnpm test -- --ci` (or equivalent) for backend and web.
   - Python (optional, only if `python/**` exists):
     - `pytest`
   - .NET (optional, only if `**/*.csproj` exists):
     - `dotnet restore`
     - `dotnet test`
   - Terraform (optional, only if `infra/**/*.tf` exists):
     - `terraform fmt -check`
     - `terraform validate`

2. **Blocking failures**
   - No `continue-on-error: true` on lint, test, or compliance jobs.
   - If any guardrail script or compliance scan fails, the workflow must fail.

3. **Docker builds**
   - For demo CI/CD, at least build images for:
     - `backend/Dockerfile`
     - `web/Dockerfile`
   - Images may be built but not pushed (demo), used to verify Dockerfiles are valid.

4. **Determinism & Guardrails**
   - CI must run a compliance/guardrail scan (e.g., `scripts/compliance-scan.mjs`) that:
     - Flags clinical/diagnostic or crisis/alert logic.
     - Flags non-deterministic core logic (e.g. `Math.random`, `Date.now`) where not explicitly allowed.
     - Optionally verifies presence of `submitted_at_utc` usage and offline queue code.

5. **Status checks & branch protection compatibility**
   - The CI workflow must be designed so that its jobs can be set as **required status checks** for `main` (and optionally `develop`).

---

## ⛔ Violations Must Be Rejected

If a workflow:

- Skips or hides lint/tests,
- Weakens guardrail checks,
- Removes Docker/Terraform checks without justification,

You must reject the change and propose an improved CI definition.

---
