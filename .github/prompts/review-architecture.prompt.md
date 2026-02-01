# 🧱 Prompt: Senior Review – Architecture / Large Change

> 📌 **Recommended Models: Claude Opus 4.5**  
> Use this prompt for reviewing **large or architectural changes** that span multiple files or layers (mobile, backend, frontend, DevOps).

---

## 🎯 Goal

Assess whether a large/architectural change:

- Aligns with the intended architecture and constraints
- Respects all compliance guardrails
- Is structured in a way that will be maintainable and testable
- Has appropriate tests and CI implications

---

## 📥 Inputs (User Provides)

- A high-level description of the change:
  - What problem it solves
  - Which work_packages/issues it covers
- Key file diffs or core modules (you can summarize peripheral changes)
- Any significant new tests or CI workflow changes

---

## 🧠 Instructions to the Agent

1. Read and internalize:
   - `.github/agents/quality-senior-reviewer.agent.md`
   - All relevant skills for the touched areas:
     - `code-review-quality`
     - `review-guardrails`
     - `review-pr-scope`
     - `ci-quality-gates`
     - `github-actions-hardening`
     - Plus timestamps, determinism, offline queue, etc. as applicable.

2. Focus more on **architecture, boundaries, and long-term maintainability** than on line-by-line nitpicks.

3. Use the standard review structure, but in `High-Level Feedback` and `Findings` prioritize:
   - Layering (mobile/backend/frontend separation)
   - Clear contracts (types, APIs, events)
   - Test boundaries (what’s unit vs integration vs E2E)
   - Operational considerations (logging, failure modes)

---

## 📤 Required Output

Follow the standard review output format from the agent spec.

Explicitly call out in `Review Decision` if you believe the architecture needs to be rethought before building more features on top.

---

## 🛡️ Constraints

- Do not re-architect the entire system in one go; focus on the change at hand.
- Do not ignore compliance and determinism just because the change is “big”.
- Encourage incrementalism and clear boundaries rather than sweeping rewrites.
