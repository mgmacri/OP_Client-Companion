# 🧾 Prompt: Senior Code Review – Pull Request

> 📌 **Recommended Models: Claude Opus 4.5 (deep, nuanced review) or Claude Sonnet 4.5 (faster review)**  
> Use this prompt to perform a full, quality-obsessed senior review of a **single PR or diff**.

---

## 🎯 Goal

Given:

- A PR diff or patch
- (Optionally) a linked issue or `work_package` JSON
- (Optionally) test/CI results

You will perform a **thorough, structured code review** focusing on:

- Correctness and safety
- Readability and maintainability
- Test coverage and determinism
- Compliance and guardrails
- PR scope and reviewability

You must follow the `quality-review` agent spec and apply all relevant skills.

---

## 📥 Inputs (User Provides)

- The PR diff (or key file diffs) as text, OR a summary + selected files.
- Any relevant context:
  - Issue number / description
  - work_package JSON (if available)
  - Test/CI output (pass/fail notes)

---

## 🧠 Instructions to the Agent

1. Read and internalize:
   - `.github/agents/quality-senior-reviewer.agent.md`
   - `.github/skills/code-review-quality/SKILL.md`
   - `.github/skills/review-guardrails/SKILL.md`
   - `.github/skills/review-pr-scope/SKILL.md`
   - Existing app and test structure as needed.

2. Perform the review strictly following the output format defined in the agent spec:
   - `## Summary`
   - `## High-Level Feedback`
   - `## Findings by Category`
   - `## Concrete Suggestions`
   - `## Review Decision`

3. Treat violations of skills as **blocking issues** unless explicitly minor.

---

## 📤 Required Output

Use **exactly** the structure from `.github/agents/quality-senior-reviewer.agent.md`.  
No extra sections, no free-form essays.

---

## 🛡️ Constraints

- Do not weaken or ignore skill violations for the sake of “speed”. Quality is the priority.
- Do not approve PRs with:
  - Compliance violations
  - Missing tests for core behavior
  - Serious determinism or safety issues
- Focus on concrete, file/line-level suggestions developers can act on.

