<!-- .github/skills/test-coverage-critical-workflows/SKILL.md -->

# ✅ Skill: Critical Workflow Test Coverage

> 📌 **Recommended Model: GPT-5.2-Codex**  
> Use this skill when designing or updating tests for core product workflows (logs, consent, queueing, notes, timestamps).

---

## 🔔 Triggers

Apply this skill whenever adding or modifying tests related to:

- Consent gating (mobile, backend enforcement)
- Log submission flows (online and offline)
- Offline queue behavior and limits
- `submitted_at_utc` storage and localized display
- Draft note creation and status (`pending_review`)

---

## ✅ Hard Rules

1. **Consent Coverage**
   - There must be tests proving:
     - Submissions without consent are blocked.
     - A static error string is shown on blocked submission.
     - Consent state is required for both direct submit and queued submit flows.

2. **UTC Timestamp Coverage**
   - Backend tests must assert:
     - `submitted_at_utc` is stamped by the server and is in UTC.
     - Client attempts to send their own `submitted_at_utc` are ignored or rejected.
   - Frontend tests must assert:
     - Localized display is derived only from `submitted_at_utc`.
     - No local time is sent back to the server.

3. **Offline Queue Coverage**
   - Tests must verify:
     - Queue limit of 50 items is enforced.
     - Enqueuing beyond 50 returns a static, deterministic error.
     - No silent data loss on queue overflow.
   - Auto-sync tests must verify:
     - Sync occurs when connectivity is restored.
     - Retries are idempotent and deterministic.

4. **Draft Note & Status Coverage**
   - Tests must ensure:
     - Draft notes are created with `status = "pending_review"` only.
     - No path creates `approved` or `rejected` notes by default.
     - Idempotent log submissions do not create duplicate draft notes.

---

## ⛔ Violations Must Be Rejected

If a test suite or PR:

- Adds behavior without corresponding tests for these critical workflows, or
- Weakens or removes existing coverage for these flows,

You MUST flag it as under-tested and propose specific tests to restore coverage.

---
