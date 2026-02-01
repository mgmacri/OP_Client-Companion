# 📶 Skill: Offline Encrypted Queue

> 📌 **Recommended Model: GPT‑5.1-Codex-Max**  
> Best for implementing and testing queue mechanics, encrypted persistence, and network-aware sync systems.

---

## 🔔 Triggers

Apply this skill to:

- Any offline queue logic (mobile)
- Submission batching
- Saga-based sync triggers
- Queue item storage or retrieval

---

## ✅ Hard Rules

1. The offline queue must be **encrypted** at rest on the device.
2. Maximum queue length is **50** — new entries must be rejected past this.
3. Sync should automatically trigger when network is restored.
4. Items should have retry metadata (`retry_count`, `last_error_code`).
5. Queue order must be preserved (FIFO).

---

## ⛔ Violations Must Be Rejected

Never allow unencrypted storage, uncontrolled queue growth, or syncs that re-submit partial/incomplete payloads. Enforce strict bounds.
