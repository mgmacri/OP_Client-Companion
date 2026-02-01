
---

```md
<!-- .github/pull_request_template.md -->

# 🧩 OP_Client-Companion Pull Request

> Please fill out all sections. Incomplete or failing checklists will block merging.

## 🧾 Summary

- **Issue(s):** Closes #ISSUE_NUMBER
- **Agent:** (Planner | Mobile | Backend | Frontend | QA+Compliance)
- **Lane:** (A | B | C | D | E, if applicable)
- **Scope:** Short description of what this PR implements.

---

## 🔍 Changes

- [ ] New features
- [ ] Bugfix
- [ ] Refactor
- [ ] Tests only
- [ ] Docs only

**Details:**

- …

---

## ✅ Compliance Checklist (Hard Guardrails)

**Consent & Compliance**

- [ ] Consent is required before creating/submitting any log entry.
- [ ] No clinical interpretation or diagnosis is introduced.
- [ ] No crisis detection or emergency alert logic is added.
- [ ] All log-derived notes created in this PR are `pending_review` only.

**Timestamps**

- [ ] `submitted_at_utc` is set server-side in UTC (not using client time).
- [ ] Timestamps in the UI are displayed in localized form only (never stored as local time).

**Offline Queue**

- [ ] Offline submissions are stored in an encrypted queue on device.
- [ ] Queue limit of 50 is enforced with a static error message when exceeded.
- [ ] Auto-sync on connectivity restoration is implemented or not touched by this PR.

**Determinism**

- [ ] No use of `Math.random`, `Date.now`, or similar non-deterministic APIs in critical paths without explicit justification.
- [ ] Draft note text is generated using schema templates only (no LLM summarization).
- [ ] Error messages are static, deterministic strings.

---

## 🧪 Testing

- [ ] `pnpm lint` passes locally
- [ ] `pnpm test` passes locally
- [ ] New tests added for this change
- [ ] Existing tests updated as needed

**Test commands run:**

```bash
pnpm lint
pnpm test
