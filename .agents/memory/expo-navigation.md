---
name: Expo navigation compatibility
description: SDK 58 tab-action and default-route behavior.
---

NativeTabs tab presses cannot be canceled with the classic navigator's `preventDefault`.

**Why:** The installed native navigator emits the event and then navigates unconditionally. Disabled native triggers instead emit a prevented tabPress without navigating; this supports the user's camera-only tab action.

**How to apply:** Preserve the action-only behavior for both native and classic tabs. Do not restore a Scan landing page to work around native event differences. Verify native behavior on a device rather than treating a browser check as equivalent.

Use `unstable_settings.anchor` with `backBehavior="initialRoute"` for a tab default.

**Why:** SDK 58 rejects the classic `initialRouteName` prop and warns on `unstable_settings.initialRouteName`; a default anchor with firstRoute back behavior also warns.

**How to apply:** Check installed navigation types before copying older Expo examples.
