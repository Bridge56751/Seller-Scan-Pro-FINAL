---
name: Expo camera focus semantics
description: Expo iOS focus flags are counterintuitive; preserve continuous autofocus.
---

In the installed Expo camera version, `autofocus="off"` maps to continuous autofocus; `"on"` performs a single focus and then locks. A temporary refocus action must return to continuous mode.

**Why:** Checking the SDK's native implementation during a close-focus complaint revealed that permanently enabling `"on"` would make ongoing barcode focusing worse, not better.

**How to apply:** Recheck the installed SDK semantics before changing focus flags. Browser previews cannot establish native focusing quality or overcome hardware minimum focus distance.
