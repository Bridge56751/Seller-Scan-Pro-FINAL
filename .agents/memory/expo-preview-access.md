---
name: Expo Go preview access
description: Physical iOS account checks differ from successful bundle and manifest checks.
---

Do not treat a hand-generated development URL QR code as proof that a physical iPhone can open the preview.

**Why:** After the SDK 58 upgrade, manifests and native exports passed, but Expo Go reported that the CLI's managed Replit account was signed in while the phone was not. A plain QR code did not resolve this account check.

**How to apply:** Use the platform's documented Open in Expo Go flow first. Inspect the actual iOS error in Metro logs before changing networking or project visibility. Never expose the managed session secret in a QR code or file. Device access remains unverified until the user confirms it.
