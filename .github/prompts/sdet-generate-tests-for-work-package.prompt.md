<!-- .github/prompts/sdet-generate-tests-for-work-package.prompt.md -->

# 🧪 Prompt: SDET – Generate Tests for a Work Package

> 📌 **Recommended Model: GPT-5.2-Codex**  
> Use this prompt to generate *targeted, deterministic tests* for a single `work_package` emitted by the Planner.

---

## 🎯 Goal

Given:

- A single `work_package` JSON object
- Existing code for that feature (mobile, backend, or frontend)

Design and implement **automated tests** that:

- Directly map to the `acceptance_criteria`
- Respect all guardrails:
  - `compliance-guardrails`
  - `test-determinism`
  - `test-coverage-critical-workflows`
  - `timestamps-utc` / `offline-encrypted-queue` / `deterministic-note-synthesis` where relevant
- Are deterministic and CI-friendly.

---

## 📥 Inputs

The user will provide:

- A single `work_package` JSON object from `work_packages`:
  - Including `title`, `lane`, `acceptance_criteria`, `skills_required`
- A short description of where the relevant code lives:
  - e.g., `mobile/src/components/...`, `backend/src/routes/...`, `web/src/components/...`

You may also read:

- `.github/agents/sdet.agent.md`
- `.github/skills/test-determinism/SKILL.md`
- `.github/skills/test-coverage-critical-workflows/SKILL.md`
- Any relevant app code under `mobile/`, `backend/`, `web/`.

---

## 📤 Required Output

You MUST respond with:

```md
## Plan

- [ ] List the test suites/files to create or update
- [ ] Map each acceptance criterion to one or more tests

## Files

### <relative path>

```ts
// path: backend/tests/utc-submission.test.ts
// full file contents here
```

Rules:

- **Plan** must explicitly reference the acceptance criteria.
- **Files** must contain full test files that compile (or clearly marked TODO stubs if the code under test doesn’t exist yet).

---

## 🛡️ Constraints

- No random or time-based behavior without mocking (`test-determinism`).
- No tests validating diagnosis, prognosis, or crisis detection (`compliance-guardrails`).
- Prefer local, in-memory mocks over real I/O (network, DB, filesystem).

---
