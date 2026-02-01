# 🧠 Copilot Agent Swarm: Instructions for OP_Client-Companion

> 📌 **Recommended Model: GPT‑5.2 + Codex-Max + Claude Opus**  
> This system orchestrates a multi-agent, skill-enforced implementation pipeline for the OP_Client-Companion MVP. Each agent and prompt file aligns with strict compliance, determinism, and offline-first architectural mandates.

---

## 🧬 Architecture Overview

This swarm is composed of:

- **Agents:** Specialized implementers (planner, mobile, backend, frontend, QA/compliance)
- **Skills:** Hard rules that must be followed in every output (guardrails)
- **Prompts:** Execution templates for backlog triage, code generation, compliance audits

---

## 🧑‍💻 Agent Swarm Roles

| Agent             | Description                                                  |
|------------------|--------------------------------------------------------------|
| `planner`         | Decomposes issues, builds dependency trees, assigns tasks   |
| `mobile`          | Implements RN forms, Redux, Saga, consent, offline queue    |
| `backend`         | Builds REST APIs, schema storage, deterministic synthesis   |
| `frontend`        | Therapist UI for pending review notes only                  |
| `qa-compliance`   | Audits logic + PRs for rule compliance + test coverage      |

Each agent file is in `.github/agents/*.agent.md`

---

## 🛡️ Skills

All code and agent outputs must comply with:

- `compliance-guardrails`
- `timestamps-utc`
- `deterministic-note-synthesis`
- `offline-encrypted-queue`

Skill definitions live in `.github/skills/**/SKILL.md`.  
Skill violations must block PRs, tests, or Copilot suggestions.

---

## 🚀 Prompt Files

These initiate Copilot flows:

- `triage-backlog.prompt.md` — Build 5-lane sprint plan
- `generate-copilot-pack.prompt.md` — Regenerate all .github files
- `implement-issue.prompt.md` — End-to-end codegen for 1 issue
- `mobile-schema-form.prompt.md` — Build RN form stack
- `backend-log-submit-and-note.prompt.md` — Backend log + note endpoints
- `qa-compliance-review.prompt.md` — Run checklist review on any commit/PR

---

## ❌ Non-Goals

These are explicitly forbidden:

- Crisis detection or escalation
- Clinical interpretations or diagnosis
- AI-based summarization of logs or notes
- Nondeterministic draft generation

---

## 🧾 Example Workflow

1. Run `triage-backlog.prompt.md` to map sprint
2. Pick one task → run `implement-issue.prompt.md`
3. Use correct agent + skills as defined in `.agent.md`
4. Submit PR with checklist from `qa-compliance-review.prompt.md`

---

## 🧩 Files to Keep Updated

- `.github/agents/*.agent.md`
- `.github/skills/**/SKILL.md`
- `.github/prompts/*.prompt.md`
- `.github/copilot-instructions.md`

Update these using the `generate-copilot-pack.prompt.md` as needed.
