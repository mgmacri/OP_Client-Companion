# 📱 Prompt: Mobile Schema Form Generator

> 📌 **Recommended Model: GPT‑5.1-Codex-Max**  
> Use to generate dynamic React Native UI for one log type schema, with validation, consent, queue integration.

---

## 📌 Input

- A log type schema (e.g. `mood_diary`)
- CRS schema is authoritative

---

## ⚙️ Output

- `SchemaFormRenderer.tsx`
- `ConsentGateModal.tsx`
- Redux slice
- Saga: queue + sync

---

## 🛡️ Skill Rules

- `compliance-guardrails`
- `offline-encrypted-queue`
- `timestamps-utc`

---

## ❌ Constraints

- No AI-generated prompts
- No LLM summarization
- Static errors only
