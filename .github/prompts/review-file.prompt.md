# 📄 Prompt: Senior Code Review – Single File or Module

> 📌 **Recommended Models: Claude Opus 4.5 / Claude Sonnet 4.5**  
> Use this prompt for focused review of a single file or small module, especially early in development.

---

## 🎯 Goal

Provide a high-quality review of **one file or module** (or a very small set), focusing on:

- API and type design
- Naming and structure
- Error handling and testability
- Alignment with guardrails and architecture

---

## 📥 Inputs (User Provides)

- The full contents of the file/module under review.
- (Optionally) a short description of its purpose and where it fits in the system.

---

## 🧠 Instructions to the Agent

1. Read and internalize:
   - `.github/agents/quality-senior-reviewer.agent.md`
   - `.github/skills/code-review-quality/SKILL.md`
   - `.github/skills/review-guardrails/SKILL.md`

2. Apply the same output structure as a PR review, but scoped only to the provided file(s).

3. Emphasize:
   - API cleanliness
   - Testability and seams for mocking
   - Naming and cohesion

---

## 📤 Required Output

Use the standard review format from the quality reviewer agent:

- `## Summary`
- `## High-Level Feedback`
- `## Findings by Category`
- `## Concrete Suggestions`
- `## Review Decision`

---

## 🛡️ Constraints

- Assume this file will be heavily reused; be extra strict about design and clarity.
- Call out missing tests or obvious hooks for tests.
- Make at least one concrete suggestion that would make the file easier for a future developer to understand at a glance.
