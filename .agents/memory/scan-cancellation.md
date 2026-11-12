---
name: Scan cancellation semantics
description: Preserve shopper state and avoid starting extra paid work after cancellation.
---

Treat cancellation as stopping work, not as a failed scan to save in History. A canceled refinement should retain the previously displayed results. Keep the accepted camera photo available for another search; delete disposable re-encodings, not photos still referenced by the current session.

**Why:** Shoppers need to recover immediately without losing existing results or creating misleading failure records. Native image preparation may finish after cancellation and cannot safely be interrupted by deleting its source.

**How to apply:** Use operation ownership checks as well as abort signals; some native work or network responses may settle after cancellation. Check cancellation before any subsequent paid request, including the empty-result fallback.
