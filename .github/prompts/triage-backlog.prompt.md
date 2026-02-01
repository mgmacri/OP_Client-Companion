# 🧩 Prompt: Triage Backlog

> 📌 **Recommended Model: GPT‑5.2**  
> Use for converting `issues.json` into an ordered, parallelizable MVP roadmap.

---

## 🧠 Purpose

Read the full `issues.json`, analyze dependencies, and output:

- 5-lane MVP sprint plan
- Ordered tasks per lane
- Suggested assignee agent
- Skill tags required
- Start blockages / priority items

---

## 📤 Output Format

```json
{
  "lanes": [
    {
      "name": "Lane A: Mobile – Consent Gate + Form Renderer",
      "tasks": [
        {"title": "Task: Mobile – Consent Gate", "agent": "mobile", "skills": ["compliance-guardrails"]},
        ...
      ]
    },
    ...
  ]
}
```

---

## 🛡️ Enforce Skills

Tag each task with relevant `SKILL.md` references.
