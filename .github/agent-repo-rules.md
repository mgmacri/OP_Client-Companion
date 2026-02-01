<!-- .github/agent-repo-rules.md -->

# 🧠 OP_Client-Companion – Agent & Repo Interaction Rules

This document defines how agents (Planner, Mobile, Backend, Frontend, QA+Compliance) MUST interact with the repository, GitHub Issues, and PRs so that all work is tracked and quality-gated.

---

## 1. Branch & Issue Conventions

Every task MUST be tied to a GitHub Issue and branch.

**Branch naming:**

```text
feature/ISSUE-<number>-<short-slug>
bugfix/ISSUE-<number>-<short-slug>
chore/ISSUE-<number>-<short-slug>
