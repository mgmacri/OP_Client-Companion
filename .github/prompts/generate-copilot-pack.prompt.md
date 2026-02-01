# 🛠️ Prompt: Generate Copilot Pack

> 📌 **Recommended Model: GPT‑5.2-Codex**  
> Use this prompt to regenerate all `.github/{agents,skills,prompts}` from scratch based on updated schemas and skills.

---

## 📦 Action

Generate:

- `.github/agents/*.agent.md`
- `.github/skills/**/SKILL.md`
- `.github/prompts/*.prompt.md`
- `.github/copilot-instructions.md`

Each file must:

- Reference the schema files
- Respect skill definitions
- Be copy/paste ready
