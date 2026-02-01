<!-- .github/prompts/devops-generate-ci-workflow.prompt.md -->

# 🧰 Prompt: Generate CI Workflow for Owl-Style Tech Stack

> 📌 **Recommended Model: GPT-5.2-Codex**  
> Use this to (re)generate `.github/workflows/ci.yml` for the demo app using:
> - Node.js + TS backend (`backend/`)
> - React/Redux web (`web/`)
> - Optional Python (`python/`)
> - Optional .NET (`**/*.csproj`)
> - Docker builds (backend + web)
> - Optional Terraform (`infra/`)

---

## 🎯 Goal

Create a deterministic, hardened CI workflow that:

- Installs dependencies and runs lint + tests for backend and web via `pnpm`.
- Optionally runs Python & .NET tests if present.
- Builds Docker images for backend and web (no push).
- Optionally runs `terraform fmt -check` and `terraform validate` for `infra/`.
- Runs a compliance / guardrail scan.
- Complies with:
  - `github-actions-hardening`
  - `ci-quality-gates`

---

## 📥 Inputs

- `backend/package.json`
- `web/package.json`
- Existing `.github/workflows/ci.yml` (if present)
- Skills:
  - `.github/skills/github-actions-hardening/SKILL.md`
  - `.github/skills/ci-quality-gates/SKILL.md`

---

## 📤 Output

```md
## Plan

- [ ] Describe which jobs will exist and what they do
- [ ] Explain how each job maps to the skills and tech stack

## Files

### .github/workflows/ci.yml

```yaml
# full workflow content

---

## 🛡️ Constraints

- Use pinned GitHub Actions versions.
- Define `permissions:` explicitly.
- No `continue-on-error` for lint, test, or compliance jobs.
- Workflows must be suitable as required status checks for `main`.

---
