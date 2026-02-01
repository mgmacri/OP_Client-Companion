# 🛡️ Skill: Review for Compliance & Guardrails

> 📌 **Recommended Models: Claude Opus 4.5 / Claude Sonnet 4.5**  
> Apply this skill on every review to ensure code respects clinical/compliance boundaries and project guardrails.

---

## 🔔 Triggers

Apply this skill whenever reviewing code that touches:

- Client logs or note content
- Draft note generation
- Consent handling
- Timestamps and timezones
- Offline queueing, sync, or storage
- Any user-facing text that might be interpreted as clinical guidance

---

## ✅ Hard Rules

1. **No Diagnosis or Clinical Interpretation**
   - Code and UI must not assign diagnoses or interpret clinical meaning.
   - No “risk scores”, “severity levels”, or “treatment recommendations” inferred from logs.

2. **No Crisis Detection or Escalation**
   - No logic to detect crises, emergencies, self-harm risk, or similar.
   - No automatic alerts or notifications suggesting urgent action.

3. **Consent is Mandatory**
   - Any changes that touch submission flows must respect consent gating.
   - No path should allow logs to be created/submitted without explicit consent.

4. **Draft Notes = Pending Review**
   - Any draft note logic must ensure initial status is `pending_review`.
   - No default `approved` or silent status transitions.

5. **Deterministic Note Synthesis**
   - No LLM-based text generation in production logic.
   - Template-based, schema-driven assembly only.

6. **Offline Queue Rules**
   - Queue must be encrypted at rest.
   - Queue limit of 50 must be enforced with static error strings.
   - No silent dropping of items or unbounded growth.

---

## ⛔ Violations Must Be Treated as Blocking

If a PR introduces or suggests:

- Diagnosis, interpretation, or crisis detection
- Non-deterministic summarization or LLM-generated draft text
- Bypassing consent, queue limits, or timestamp rules

You MUST treat this as a **blocking issue** and request changes.
