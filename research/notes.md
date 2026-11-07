# Research Notes: Sharing SearchApi between apps

**Status:** complete
**Depth:** Quick (focused provider-safety question)

## Plan
- **Question:** Can this app use SearchApi without disrupting the user's other app?
- **Scope:** Public provider documentation, authentication, shared quotas, billing, isolation. No account access or live API tests.
- **Audience:** App owner.
- **Deliverable:** Evidence-based safety recommendation, with explicit unknowns.

## Focus Areas
| # | Area | Status | Sources |
|---|---|---|---|
| 1 | Authentication and multi-app restrictions | done | 5 reviewed |
| 2 | Quotas, billing and failure behavior | done | 5 reviewed |
| 3 | Isolation options and safeguards | done | 5 reviewed |

## Coverage Checklist
- [x] Different URL: key authentication documented; account restrictions unverified. [@google-auth]
- [x] Multi-app/domain restrictions: no explicit single-domain restriction found; not proof of permission for every configuration. [@terms]
- [x] Shared limits: account-level reporting documented; treat capacity as shared pending confirmation. [@account]
- [x] Exhaustion: exact monthly-credit behavior moved to Limitations; rate-limit 429 documented for a reviewed endpoint. [@errors]
- [x] Separate keys: documented historically; quota isolation moved to Limitations. [@keys]
- [x] Safest setup: remain disconnected until independent allocation is confirmed, or use a different provider.
- [x] Account-specific plan, usage, restrictions and billing remain unverified.

## Findings Log
- Key-based authentication is not a guarantee of isolated quotas. [@google-auth] [@account]
- Historical announcement supports multiple keys, not separate allowances. [@keys]
- Pricing FAQ states 20% hourly utilization and billing for successful HTTP 200 searches. [@pricing]
- One-person/one-account terms mean a duplicate personal account is not a default workaround. [@terms]
- Full report: searchapi-account-safety.md. Registry: sources.json.

## Conflicts & Open Questions
- Absence of a documented restriction does not prove an account is unrestricted.
- First-party sources are authoritative for API behavior, but not independent corroboration.
- Historical key-management details require current confirmation.

## Gaps
- No access to the user's plan, key controls or other app.
- Per-key hard quotas, exact exhausted-credit response and automatic top-ups remain Limitations.
- Recent-announcements sweep found no new isolation guarantee; search evidence saved.
