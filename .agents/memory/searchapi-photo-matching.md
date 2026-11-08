---
name: SearchApi photo matching
description: Provider compatibility and privacy constraints for image-based shopping searches
---

SearchApi's October 7, 2026 breaking change removed Google Lens `search_type=products`. Use visual suggestions followed by a separate shopping query; do not revive the deprecated product tab based on older examples.

**Why:** The live documentation explicitly reports errors for that old mode, even while older changelog text still lists it.

**How to apply:** Re-check current provider documentation when changing image matching. Follow the results-first UX in replit.md: the user explicitly approved searching automatically from a visual suggestion, with optional refinement. Label those results uncertain instead of inventing user confirmation. The custom consent popup was explicitly removed. A photo URL must work across server replicas, not just on the process handling the upload.

Google Shopping's `link=resolved` resolves ad redirects only, not ordinary `product_link` comparison pages.

**Why:** Live verification opened a Google Shopping page (and Google's traffic challenge), not the merchant. SearchApi's documentation confirms this distinction.

**How to apply:** Do not promise direct merchant navigation merely because `link=resolved` is set. Label comparison destinations honestly; obtaining merchant offers requires a separate supported lookup.
