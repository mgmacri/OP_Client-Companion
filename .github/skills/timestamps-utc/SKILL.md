# ⏰ Skill: UTC Timestamp Enforcement

> 📌 **Recommended Model: GPT-5.2-Codex**  
> Ideal for deterministic timestamp validation, serialization correctness, and backend audit trail enforcement.

---

## 🔔 Triggers

Apply this skill to:

- Submission logic for any log
- Backend models storing time
- UI components displaying timestamps

---

## ✅ Hard Rules

1. Store `submitted_at_utc` **in UTC only**, using a server-generated timestamp.
2. Client input timestamps are forbidden.
3. UI must **display** time in the user's local time zone, clearly marked.
4. No time strings should be stored with timezone offsets (always UTC).
5. `submitted_at_utc` must be used for record sorting, auditing, and syncing.

---

## ⛔ Violations Must Be Rejected

Submissions with local time must be blocked. PRs must fail if UTC is not enforced in backend logic or time formatting.
