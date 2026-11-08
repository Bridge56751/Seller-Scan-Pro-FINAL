---
name: Dependency compatibility
description: Keep firewall remediation compatible with the mobile framework.
---

Preserve the current Expo SDK major when fixing package-firewall failures. Use compatible patch updates and narrowly scoped overrides for transitive packages when upgrading their parent would require a React Native/Expo migration.

**Why:** Clean installs exposed blocked transitive dependencies in the mobile build tools. Fixing those did not require a major mobile SDK upgrade.

**How to apply:** Inspect the complete install log for all blocked packages, verify their parents' version ranges, and rerun the configured post-merge setup after updating the lockfile. Do not bypass the firewall or silently skip installation.

For an explicitly authorized Expo major upgrade, distinguish stale npm peer-resolution state from genuine package incompatibility.

**Why:** During the SDK 57 → 58 transition, npm retained the old Router optional-peer tree and reported conflicts even after all requested versions matched Expo's recommendations. A clean resolution succeeded without force or legacy peer flags.

**How to apply:** Inspect the conflicting peer ranges and installed tree first. If the ranges agree, preserve a recovery copy before regenerating installation state; review unrelated dependency drift and require online Expo compatibility checks plus native exports afterward. Never use force flags to conceal a real mismatch.
