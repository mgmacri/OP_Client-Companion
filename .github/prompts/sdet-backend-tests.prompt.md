<!-- .github/prompts/sdet-backend-tests.prompt.md -->

# 🧪 Prompt: SDET – Backend Test Generation

> 📌 **Recommended Model: GPT-5.2-Codex**  
> Use this prompt to build or extend backend tests for Node.js/TypeScript services and REST APIs.

---

## 🎯 Goal

Create or update backend tests that validate:

- Consent enforcement in API endpoints
- `submitted_at_utc` behavior (server-side, UTC only)
- Idempotent log submissions (idempotency_key behavior)
- Draft note creation and status `pending_review`
- Deterministic template-based note synthesis (no LLM, no randomness)

---

## 📥 Inputs

The user will provide:

- Target endpoint(s) and modules (e.g., `/api/logs`, `/api/draft-notes`)
- Relevant schemas or types (e.g., `ClientLogEntry`, `DraftNote`)
- Existing test files (if any)

You may read:

- `.github/agents/sdet.agent.md`
- `.github/skills/test-determinism/SKILL.md`
- `.github/skills/test-coverage-critical-workflows/SKILL.md`
- Backend code under `backend/src/**`.

---

## 📤 Required Output

```md
## Plan

- [ ] Describe which backend behaviors to test (per endpoint)
- [ ] Map behaviors to acceptance criteria / skills

## Files

### backend/tests/logs-submission.test.ts

```ts
// path: backend/tests/logs-submission.test.ts
// full file contents here
```

---

## 🛡️ Constraints

- Use Jest (or repo-standard) test runner.
- Use supertest (or equivalent) for HTTP-level tests if the project already depends on it.
- Do not make real network calls; tests must be fully local.
- Assert exact error codes and strings for consent and validation failures.
- Assert that:
  - `submitted_at_utc` is set server-side
  - Draft notes are always `pending_review` on creation
  - Idempotent retries do not create duplicates

---
