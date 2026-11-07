#!/usr/bin/env bash
set -euo pipefail
npm ci --no-audit
# Development schema only. Production schema changes belong to the platform publish flow.
npm run db:push -- --force
