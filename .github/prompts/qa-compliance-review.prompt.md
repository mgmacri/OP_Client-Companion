# 🧪 Prompt: QA + Compliance Review

> 📌 **Recommended Model: Claude Opus 4.5**  
> Use to run a review checklist against any PR or commit for compliance, determinism, consent, and queue limits.

---

## 📋 Tasks

- Check for hard skill rule violations
- Assert presence of tests for: consent, timestamps, queue limit, draft notes
- Emit PR checklist summary

---

## ✅ Output

```json
{
  "checklist": [
    "✓ Consent gate blocks submission",
    "✓ submitted_at_utc is UTC server-side",
    "✓ Offline queue is encrypted, capped at 50",
    "✓ All draft notes are pending_review only"
  ]
}
```

---

## 🔐 Must Fail If

- Any rule from `.github/skills/**/SKILL.md` is violated
- Any dynamic LLM logic is detected in commits
