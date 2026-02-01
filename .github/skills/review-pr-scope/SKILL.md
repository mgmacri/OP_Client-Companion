# 📏 Skill: PR Scope & Reviewability

> 📌 **Recommended Models: Claude Opus 4.5 / Claude Sonnet 4.5**  
> Use this skill to ensure each PR is reasonably scoped, reviewable, and maintainable.

---

## 🔔 Triggers

Apply this skill whenever:

- Reviewing a PR with many changed files
- Reviewing a PR that mixes multiple concerns (feature + refactor + style)
- Reviewing early-stage architectural changes

---

## ✅ Hard Rules

1. **One Intent per PR (Preferably)**
   - A PR should address a single work_package, issue, or clearly defined concern.
   - Mixing unrelated changes should be flagged for future separation.

2. **Avoid Drive-by Refactors**
   - Refactors are welcome, but must be either:
     - In a dedicated refactor PR, or
     - Clearly tied to making the current change safe/clean.
   - Unrelated renames, reformatting, or large restructuring without tests must be flagged.

3. **Size & Cognitive Load**
   - Very large diffs (e.g. hundreds of lines / dozens of files) should be treated as high-risk.
   - Suggest splitting into smaller PRs with clearer surfaces when feasible.

4. **Review Ready**
   - PRs must have:
     - Passing CI (lint, tests, compliance) before review approval.
     - A descriptive PR title and summary.
     - Reference to the issue/work_package being addressed.

---

## ⛔ Violations Must Be Called Out

If a PR:

- Is excessively large or mixes unrelated changes,
- Has no clear link to an issue/work_package,
- Fails CI or obviously lacks tests,

You must request either:
- A split into smaller PRs, or
- Additional context + tests before approval.
