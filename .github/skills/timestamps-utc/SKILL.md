# ⏱️ Skill: Timestamps UTC

> 📌 **Recommended Model: GPT‑5.1-Codex-Max**  
> Best for implementing server-side timestamping, display-only localization, and deterministic time handling with tests.

---

## 🔔 Triggers

Apply this skill to any change involving:

- `submitted_at_utc` creation or storage
- Server-side log submission handling
- Frontend time display or formatting
- API request/response timestamp fields
- Tests validating timestamp behavior

---

## ✅ Hard Rules

1. Backend must stamp `submitted_at_utc` **server-side** in UTC for all submissions.
2. Backend must **ignore any client-provided** `submitted_at_utc` field.
3. Frontend must display localized time **derived only** from `submitted_at_utc` (display-only conversion).
4. Frontend must **never** send localized time back as source-of-truth.
5. Tests are **required** for:
   - backend stamping/ignore-client behavior
   - frontend display formatting from `submitted_at_utc`

---

## ⛔ Violations Must Be Rejected

Reject changes that accept client timestamps as authoritative, generate `submitted_at_utc` on the client, send localized times back to the server, or omit required tests.