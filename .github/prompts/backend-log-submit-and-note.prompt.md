# 🧩 Prompt: Backend Log Submit + Draft Note

> 📌 **Recommended Model: GPT‑5.2-Codex**  
> For implementing backend log intake + deterministic note generation via schema templates.

---

## 📌 Input

- One log type schema
- Required backend endpoints

---

## 🛠️ Tasks

- `/api/logs` POST with validation
- Stamp `submitted_at_utc` server-side
- Use `note_placement` for deterministic template generation
- Set note status = `pending_review`

---

## 🛡️ Skill Rules

- `compliance-guardrails`
- `timestamps-utc`
- `deterministic-note-synthesis`
