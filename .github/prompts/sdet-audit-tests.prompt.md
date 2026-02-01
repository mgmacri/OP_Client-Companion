<!-- .github/prompts/sdet-audit-tests.prompt.md -->

# 🔍 Prompt: SDET – Test Suite Audit

> 📌 **Recommended Model: Claude Opus 4.5**  
> Use this prompt to review the existing test suite and identify gaps against skills and work_packages.

---

## 🎯 Goal

Perform an audit of current tests to answer:

- Which critical workflows are covered?
- Which acceptance criteria from `work_packages` are not yet validated by tests?
- Where do tests violate determinism or compliance skills?

---

## 📥 Inputs

The user will provide:

- One or more `work_packages` (JSON) for reference.
- A list of test directories:
  - `backend/tests/**`
  - `mobile/src/__tests__/**`
  - `web/src/__tests__/**`

You may also read:

- `.github/agents/sdet.agent.md`
- `.github/skills/test-determinism/SKILL.md`
- `.github/skills/test-coverage-critical-workflows/SKILL.md`
- `.github/skills/compliance-guardrails/SKILL.md`
- `.github/prompts/qa-compliance-review.prompt.md`

---

## 📤 Required Output

```json
{
  "summary": {
    "overall_coverage": "low" | "medium" | "high",
    "overall_determinism": "low" | "medium" | "high",
    "key_risks": [
      "Missing consent gating tests on mobile submit",
      "No test for pending_review draft note creation"
    ]
  },
  "by_work_package": [
    {
      "title": "Task: Mobile – Consent Gate",
      "coverage_status": "covered" | "partial" | "missing",
      "existing_tests": [
        "mobile/src/__tests__/consent-gate.test.tsx"
      ],
      "gaps": [
        "No test asserting static error string when consent is false"
      ]
    }
  ],
  "violations": [
    {
      "type": "NONDETERMINISTIC_TEST",
      "file": "backend/tests/foo.test.ts",
      "details": "Uses Date.now() directly in an assertion"
    }
  ],
  "recommended_actions": [
    "Add consent-gate tests for queued submissions",
    "Mock Date.now() in utc-submission tests"
  ]
}
```

🛡️ Constraints

Do not suggest adding tests that validate diagnosis, prognosis, or crisis detection.

Call out any test usage of Math.random, Date.now, or new Date without mocking.

Call out missing tests for:

Consent gating

submitted_at_utc

Queue limits

Draft note pending_review status

Deterministic note synthesis