<!-- .github/skills/test-determinism/SKILL.md -->

# 🧪 Skill: Test Determinism & Stability

> 📌 **Recommended Model: GPT-5.2-Codex**  
> Use this skill for any change involving automated tests (unit, integration, or E2E) to ensure they are deterministic, repeatable, and non-flaky.

---

## 🔔 Triggers

Apply this skill whenever:

- Adding or modifying tests under:
  - `mobile/**/__tests__/**`
  - `mobile/**/tests/**`
  - `backend/**/tests/**`
  - `web/**/tests/**`
- Changing shared test utilities or fixtures:
  - `**/test-utils/**`
  - `**/jest.setup.*`
- Adding new test runners or frameworks.

---

## ✅ Hard Rules

1. **No Uncontrolled Randomness**
   - Tests must NOT rely on:
     - `Math.random()`
     - `Date.now()`
     - `new Date()`
   - If time or randomness is required:
     - Use explicit mocks (e.g., Jest `useFakeTimers`, `jest.spyOn(Date, 'now')`).
     - Document the behavior in comments.

2. **Stable Assertions**
   - Avoid vague assertions like:
     - `expect(x).toBeTruthy()`
     - `expect(x).toBeDefined()`
   - Prefer explicit, deterministic checks:
     - Exact error strings
     - Exact statuses / state transitions
     - Specific counts and shapes of objects

3. **No External Dependencies**
   - Tests must not rely on:
     - Real network requests
     - Real time (wall clock)
     - External services or APIs
   - Use mocks, fakes, or local fixtures for all external interactions.

4. **Idempotent Runs**
   - Tests must pass when run:
     - Individually
     - As a suite
     - Multiple times in a row
   - Tests must not depend on order or shared mutable global state.

---

## ⛔ Violations Must Be Rejected

If proposed tests:

- Use random or time-based behavior without proper mocking,
- Depend on live network / side effects,
- Assert non-deterministic outputs (like LLM-based strings),

You MUST reject the change and propose a deterministic, mocked alternative.

---
