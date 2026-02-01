<!-- .github/skills/github-actions-hardening/SKILL.md -->

# 🛡️ Skill: GitHub Actions Hardening

> 📌 **Recommended Model: GPT-5.2**  
> Use this for any change to `.github/workflows/*.yml` or CI helper scripts.

---

## 🔔 Triggers

- Changes to `.github/workflows/*.yml`
- Changes to `scripts/*` used in workflows
- Introduction of new CI jobs for Node, React, Python, .NET, Docker, or Terraform

---

## ✅ Hard Rules

1. **Least privilege permissions**
   - Define `permissions:` at workflow or job level.
   - Only request what’s needed (e.g., `contents: read` for CI; `pull-requests: write` if commenting).

2. **Pinned Actions**
   - Use versioned actions: `actions/checkout@v4`, `actions/setup-node@v4`, `actions/setup-python@v5`, `actions/setup-dotnet@v4`, `hashicorp/setup-terraform@v3`, etc.
   - Never use `@main`, `@master`, or unpinned refs.

3. **Secrets**
   - Access secrets using `${{ secrets.* }}` only.
   - Never echo secrets or environment variables containing secrets.
   - Never store secrets in artifacts or caches.

4. **Safe runners & concurrency**
   - Explicitly use `runs-on: ubuntu-latest` or other approved runners.
   - For any future deploy workflows, use `concurrency` to avoid overlapping deploys.

5. **No destructive automation**
   - CI must not force-push, rewrite branches, or merge PRs automatically to `main`/`production`.
   - CI must not modify source files and commit them back automatically.

---

## ⛔ Violations Must Be Rejected

If a workflow:

- Uses unpinned actions,
- Grants overly broad permissions,
- Logs or mishandles secrets,

You must reject the change and propose a hardened variant.

---
