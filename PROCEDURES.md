# Pet procedures

Open **Dashboard > Procedures** to add and update grooming sessions, vaccinations, surgery, dental care, diagnostics, treatments, wellness visits, and other services. Each record includes a pet, service name, type, local date and time, progress status, optional staff member, fee in PKR, and notes.

For an existing hospital database, apply the additive setup:

```
node scripts/migrate-procedures.mjs
```

The migration creates `PetProcedure` and copies existing `Grooming` records without changing the originals. It is safe to repeat and does not overwrite procedure edits. New records and updates use `PetProcedure`. Dates are stored in UTC and shown in the viewing device's local time. Existing grooming dates are preserved as stored.

Writes require a signed-in account. Categories accept custom service names so the practice can record services beyond the examples shown in the form. Procedure records retain their pet association; pets with procedure history cannot be deleted through a cascading database operation.
