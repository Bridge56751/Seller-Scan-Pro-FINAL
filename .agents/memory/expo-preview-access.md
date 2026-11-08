---
name: Expo Go preview access
description: Physical iOS account checks differ from successful bundle and manifest checks.
---

Do not treat a hand-generated development URL QR code as proof that a physical iPhone can open the preview.

**Why:** After the SDK 58 upgrade, manifests and native exports passed, but Expo Go reported that the CLI's managed Replit account was signed in while the phone was not. A plain QR code did not resolve this account check.

**How to apply:** Use the platform's documented Open in Expo Go flow first. Inspect the actual iOS error in Metro logs before changing networking or project visibility. Never expose the managed session secret in a QR code or file. Device access remains unverified until the user confirms it.

Check workflow port detection separately from HTTP reachability when Replit's phone frame stays on “Your app is starting.”

**Why:** The loopback-bound Expo server served browser requests while workflow status reported no open ports. Binding all interfaces made port detection report the expected port. This is evidence of corrected readiness detection, not proof that the user's embedded panel or iPhone login works.

**How to apply:** Confirm the actual listening address and workflow open-port status; preserve the public proxy URL while correcting the bind address. Do not repeatedly change app UI to fix the platform's loading screen.
