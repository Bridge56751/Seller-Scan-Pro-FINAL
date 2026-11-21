---
name: Free scan policy
description: Shared successful-scan allowance requested by the user.
---
Offer five successful scans total across barcode and photo scans, then require Pro for further scans. Failed and empty scans do not consume the free allowance.

**Why:** The user explicitly requested five SUCCESSFUL scans shared between both scanning methods, replacing the separate one-per-type allowance.

**How to apply:** Keep success accounting server-authoritative and reserve concurrent capacity before calling providers. Abuse limits still count attempts. The new allowance starts fresh because older counters measured attempts, not verified successes.
