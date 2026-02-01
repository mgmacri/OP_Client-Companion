<!-- .github/prompts/sdet-mobile-tests.prompt.md -->

# 📱 Prompt: SDET – Mobile (React Native) Test Generation

> 📌 **Recommended Model: GPT-5.1-Codex-Max**  
> Use this prompt to generate React Native tests for mobile flows (forms, consent, queue behavior) with Redux and Sagas.

---

## 🎯 Goal

Create or update tests that validate mobile behavior for:

- Consent gating (`ConsentGateModal`, banners, Redux state)
- Schema-based forms (Mood Diary, CBT, etc.)
- Validation ordering and deterministic error messages
- Queue limit and consent blocking before queueing

---

## 📥 Inputs

The user will provide:

- The specific mobile component/slice/saga to test (e.g. `logFormSlice`, `ConsentGateModal`, `queueSyncSaga`).
- Any relevant `work_package` JSON from the Planner describing acceptance criteria.

You may read:

- `.github/agents/sdet.agent.md`
- `.github/skills/test-determinism/SKILL.md`
- `.github/skills/test-coverage-critical-workflows/SKILL.md`
- Mobile code under `mobile/src/**`.

---

## 📤 Required Output

```md
## Plan

- [ ] Identify which mobile flows (consent, form validation, queue) will be tested
- [ ] Map each test to its acceptance criteria and skills

## Files

### mobile/src/__tests__/consent-gate.test.tsx

```tsx
// path: mobile/src/__tests__/consent-gate.test.tsx
// full file contents here
```

---

## 🛡️ Constraints

- Use React Native Testing Library (or repo-standard) for component tests.
- Use Redux-Saga test helpers (or repo-standard) for saga tests.
- Do NOT simulate network calls; mock them.
- Ensure tests:
  - Fail when consent is false and submit/queue is attempted.
  - Pass when consent is true and inputs are valid.
  - Assert the static error strings, not just “truthy”.

---
