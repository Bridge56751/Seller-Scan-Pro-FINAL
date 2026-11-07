# Shopping schema and release verification

## Schema application

This project uses Replit's managed PostgreSQL. `shopping_photos` is defined in
`shared/schema.ts` and has been applied to the task's development database.

There are two schema application points:

1. Task merge: `scripts/post-merge.sh` runs `npm run db:push -- --force` against
   development after installing dependencies.
2. Publish: Replit's publish flow compares development and production schemas
   and applies the schema diff, including `shopping_photos`, to production.
   This is the explicit publish-time schema step; it is platform-managed, not a
   command in the application's build or run script.

Do **not** add production `db:push` to deployment build/run commands or create
tables on application startup. Those bypass the supported schema confirmation
flow. See `.local/skills/database/references/database-migrations-on-publish.md`.

No production migration or deployment was performed by this task. Production
release must include the platform-managed schema diff; uploading only the
application bundle without that step is not supported. If the database is
ever moved to an external provider, define that provider's migration process
before releasing.

## Verification evidence

- A real uploaded public product photograph returned Google Lens matches through
  `/api/shopping/identify`, not a direct-provider-only call.
- The temporary database record count was zero after the response.
- Real US and Canadian comparisons returned offers and their requested markets.
- The browser check completed one real comparison and confirmed that editing a
  variant clears results and resets confirmation.
- The successful-flow test uses a fresh isolated schema, applies the table
  definition, and exercises upload, provider image retrieval, cleanup, and
  confirmed comparison. Provider responses in that test are controlled fixtures,
  not data served to users.
- Native camera behavior on physical iPhone and Android remains a separate task.
