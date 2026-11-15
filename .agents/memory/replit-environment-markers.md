---
name: Replit environment markers
description: Distinguish the platform environment from an app deployment when gating test access.
---

Do not use `REPLIT_ENVIRONMENT=production` to determine whether this app is published. Workspaces also carry that platform marker. Gate development-only access with `NODE_ENV=development`, no `REPLIT_DEPLOYMENT` marker, and the approved tester allowlist.

**Why:** The workspace had the platform marker set to production while running the development backend, causing valid approved Test Store subscribers to receive scan-limit denials. Replit's documentation confirms published apps use `REPLIT_DEPLOYMENT=1`.

**How to apply:** Include the platform production marker in workspace test fixtures; continue testing that published deployments reject test access and test-generated search permits.
