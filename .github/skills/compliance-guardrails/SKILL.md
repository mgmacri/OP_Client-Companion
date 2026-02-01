# 🛡️ Skill: Compliance Guardrails

> 📌 **Recommended Model: Claude Opus 4.5**  
> Optimized for precision legal logic and multi-step compliance constraint verification. Use this model when reviewing or generating code that touches clinical data handling or workflow constraints.

---

## 🔔 Triggers

Activate this skill for any change involving:

- Log entry submission
- Consent handling
- Draft note creation
- Status transition logic
- Therapist review flows

---

## ✅ Hard Rules

1. Consent is **required** before any log can be created or submitted.
2. No clinical interpretation or diagnosis can be generated or implied.
3. No crisis detection, alerting, or emergency escalation is allowed.
4. All notes must be created in `"pending_review"` status only.
5. The frontend must reflect the pending status visually — without approval actions unless stubbed.

---

## ⛔ Violations Must Be Rejected

If any of the above rules are not met, **reject the change**, add static error messages, and fail tests or PRs if automated.
