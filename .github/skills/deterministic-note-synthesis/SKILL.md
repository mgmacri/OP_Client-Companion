# 📘 Skill: Deterministic Note Synthesis

> 📌 **Recommended Model: GPT‑5.2**  
> Use for note generation logic where determinism, static error handling, and schema-driven text synthesis is critical. Avoid all LLM improvisation.

---

## 🔔 Triggers

Use this for:

- Draft note generation (backend)
- Static error message design
- Schema → text transformation logic

---

## ✅ Hard Rules

1. Use only schema-defined `note_placement` to synthesize content.
2. No summarization or free-form text generation.
3. All output must be deterministic: same inputs → same outputs.
4. Errors must be static strings (e.g. `"Field X is required"`), never dynamic or templated with AI.
5. Notes must always be created in `"pending_review"` state.

---

## ⛔ Violations Must Be Rejected

Any use of randomness, AI summarization, or dynamic phrasing is a violation. Reject the PR or fail CI.
