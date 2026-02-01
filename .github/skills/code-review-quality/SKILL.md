# 🧪 Skill: Code Review Quality Standards

> 📌 **Recommended Models: Claude Opus 4.5 / Claude Sonnet 4.5**  
> Apply this skill to any manual or automated code review for OP_Client-Companion.

---

## 🔔 Triggers

Use this skill whenever:

- Reviewing a PR or diff
- Reviewing major new files (features, modules, or services)
- Reviewing substantial refactors or test additions

---

## ✅ Hard Rules

1. **Clarity Over Cleverness**
   - Prefer simple, readable constructs over clever one-liners.
   - Complex logic must be broken into well-named functions or modules.

2. **Naming & Intent**
   - Names (variables, functions, types) must clearly describe intent.
   - Avoid ambiguous or misleading names, especially in domain objects like `ClientLogEntry`, `DraftNote`, `OfflineQueueItem`.

3. **Small, Focused Changes**
   - PRs should aim to do **one thing well** (feature, bugfix, refactor).
   - Flag mixed changes (feature + unrelated refactor) as scope creep.

4. **Error Handling & Logging**
   - Errors must use static, deterministic strings (no random variation).
   - Logging should be structured and meaningful, avoiding sensitive data.

5. **Tests are Non-Optional for Behavior Changes**
   - New behavior must have tests (unit/integration/E2E as appropriate).
   - Bugfixes should add regression tests.
   - Test names must describe the behavior, not the implementation.

---

## ⛔ Violations Must Be Flagged

If code:

- Is hard to read or understand quickly,
- Mixes many unrelated changes,
- Lacks tests for new behavior,
- Uses vague naming or misleading structures,

You MUST flag it as a quality issue and propose specific improvements.
