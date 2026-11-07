---
name: SearchApi photo matching
description: Provider compatibility and privacy constraints for image-based shopping searches
---

SearchApi's October 7, 2026 breaking change removed Google Lens `search_type=products`. Use visual suggestions followed by a separately confirmed shopping query; do not revive the deprecated product tab based on older examples.

**Why:** The live documentation explicitly reports errors for that old mode, even while older changelog text still lists it.

**How to apply:** Re-check current provider documentation when changing image matching. Preserve the separate variant-confirmation and photo-consent gates. A photo URL must work across server replicas, not just on the process handling the upload.
