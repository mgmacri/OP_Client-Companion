# 🧠 OP_Client-Companion – Agent → Model Map

This document lists each Copilot agent in the OP_Client-Companion swarm and the **recommended model** to use for that agent’s role.

> Suggested path: `.github/AGENT-MODELS.md`

---

## 📋 Summary Table

| Agent File                               | Agent Role                         | Recommended Model           | Notes |
|------------------------------------------|------------------------------------|-----------------------------|-------|
| `.github/agents/planner.agent.md`        | Planner / Decomposer               | **GPT-5.2**                 | Best for deep reasoning, dependency graphs, and contract design. |
| `.github/agents/mobile.agent.md`         | Mobile Implementer (RN + Redux)    | **GPT-5.1-Codex-Max**       | Top-tier codegen for React Native, Redux, Sagas, and offline flows. |
| `.github/agents/backend.agent.md`        | Backend Implementer (API + DB)     | **GPT-5.2-Codex**           | Strong for TypeScript, REST, SQL schemas, and deterministic services. |
| `.github/agents/frontend.agent.md`       | Therapist Admin / Review UI        | **Claude Sonnet 4.5**       | Great at clean, safe, readable UI and UX copy, minimal logic. |
| `.github/agents/qa-compliance.agent.md`  | QA + Compliance Sentinel           | **Claude Opus 4.5**         | Excellent for rule enforcement, test design, and catching violations. |

---

## 🧭 Usage Notes

- When starting a **new chat** for an agent, explicitly select the model from the table and paste in the corresponding `.agent.md` file to set the role.
- Always also load the relevant **skills** from `.github/skills/**/SKILL.md` so the model treats them as hard, non-negotiable rules.
- For mixed tasks (e.g., both heavy planning and codegen), you can:
  - Use **GPT-5.2** first to design the plan/contract, then
  - Hand the work off to **GPT-5.1-Codex-Max** or **GPT-5.2-Codex** for actual implementation.

---

## 🧑‍💻 Agents (What They Do)

- **planner**: Parses issues and schemas, produces dependency‑aware work packages with acceptance criteria and skill tags.
- **mobile**: Builds schema‑driven RN forms, consent gating, offline encrypted queue, and sync logic.
- **backend**: Implements log intake endpoints, UTC stamping, validation, and deterministic draft note creation.
- **frontend**: Therapist admin UI to list pending review notes with safe, stub‑only actions.
- **qa-compliance**: Enforces skill rules, adds tests, and blocks changes that violate compliance or determinism.

---

## 🛡️ Skills (Hard Rules)

- **compliance-guardrails**: Consent required, no diagnosis or crisis logic, notes always `pending_review`, UI shows pending status.
- **timestamps-utc**: Server‑stamped UTC only; client timestamps forbidden; UI displays localized time.
- **deterministic-note-synthesis**: Schema‑driven templates only; static error strings; no AI summarization.
- **offline-encrypted-queue**: Encrypted at rest, FIFO, max 50 items, retry metadata, auto‑sync on reconnect.

---

## 🚀 Prompts (When To Use)

- **triage-backlog.prompt.md**: Convert `issues.json` into a 5‑lane MVP plan with dependencies and skill tags.
- **implement-issue.prompt.md**: Implement one atomic issue with tests and PR summary.
- **mobile-schema-form.prompt.md**: Generate RN schema form stack with validation, consent, queue, and sync.
- **backend-log-submit-and-note.prompt.md**: Build `/api/logs` POST, UTC stamping, and deterministic note generation.
- **qa-compliance-review.prompt.md**: Run a compliance checklist against any commit/PR.
- **generate-copilot-pack.prompt.md**: Regenerate all `.github` agent/skill/prompt files when schemas or rules change.

