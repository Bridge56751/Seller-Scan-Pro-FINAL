---
name: Billing test compatibility
description: RevenueCat Test Store SDK differences encountered during purchase testing.
---

Do not rely only on RevenueCat's `userCancelled` flag to recognize cancellation. The Web Test Store SDK can throw numeric `errorCode: 1`, while native uses string `code: "1"`; the React Native wrapper may overwrite the cancellation flag.

**Why:** A real Test Store browser run completed purchases, restores and reloads successfully but displayed a false error after Cancel until both error shapes were handled.

**How to apply:** Keep cancellation handling compatible with both SDKs and distinguish cancellation from genuine provider errors. Browser testing proves the Test Store path, not physical iPhone or Apple sandbox purchases.

All verified TestFlight purchasers should receive scan access, not only an approved tester list.

**Why:** The user explicitly chose all verified TestFlight purchasers after Apple sandbox purchases were rejected by a production-only verification path.

**How to apply:** Treat RevenueCat-verified Apple sandbox entitlements separately from real paid subscriptions and simulated Test Store purchases. Apple sandbox access uses the same customer scan limits. Simulated Test Store access remains restricted to approved development testers. Never trust a client claim that it is TestFlight; verify the store, environment, entitlement, access status, and expiry server-side.
