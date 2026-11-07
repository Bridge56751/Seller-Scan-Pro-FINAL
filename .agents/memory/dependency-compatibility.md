---
name: Dependency compatibility
description: Keep firewall remediation compatible with the mobile framework.
---

Preserve the current Expo SDK major when fixing package-firewall failures. Use compatible patch updates and narrowly scoped overrides for transitive packages when upgrading their parent would require a React Native/Expo migration.

**Why:** Clean installs exposed blocked transitive dependencies in the mobile build tools. Fixing those did not require a major mobile SDK upgrade.

**How to apply:** Inspect the complete install log for all blocked packages, verify their parents' version ranges, and rerun the configured post-merge setup after updating the lockfile. Do not bypass the firewall or silently skip installation.
