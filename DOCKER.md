# Docker and automatic MySQL setup

Requires Docker Engine/Desktop with Docker Compose v2 and a reachable MySQL server.

1. Edit `.env`. Set `DB_HOST` (server IP/hostname), `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`. `.env.example` documents these settings. The existing `.env` has been converted while preserving its previous database connection values. Wrap passwords in single quotes so dollar signs remain literal.
2. For MySQL running on the same computer as Docker, set `DB_HOST=host.docker.internal`; `localhost` inside the app container refers to the container itself. For a remote server, use that server's address. MySQL must permit connections from the Docker host.
3. Set a random `NEXTAUTH_SECRET`, and set `NEXTAUTH_URL` to the application's public URL.
4. Run `docker compose up -d --build`. Open http://localhost:3000 (or your configured APP_PORT).
5. Inspect startup with `docker compose logs -f app`.

The container waits for MySQL, creates DB_NAME if missing, runs `prisma migrate deploy`, then starts Next.js. A failed setup or migration prevents the web server from starting. The supplied database account needs CREATE DATABASE and the DDL/DML permissions required by migrations on this database. The Docker configuration uses your external database server; database storage is managed there.

The same setup runs on `npm run dev`, `npm start`, and `npm run db:deploy` outside Docker. For local development, DB_HOST is usually localhost. Separate database fields take precedence over DATABASE_URL; the startup script builds a URL with encoded credentials. Do not commit `.env`.

## Future migrations

After editing `prisma/schema.prisma`, create a migration against a development database:

```sh
npm run db:migrate -- --name describe_change
```

Commit the schema and new `prisma/migrations` files, then deploy with `docker compose up -d --build`. Each new container startup automatically applies all pending migrations once, tracked by Prisma. Schema edits must have a generated migration; production never generates migration SQL. Running containers pick up new migrations when rebuilt/restarted with the new image.

## Existing databases

Fresh empty databases work automatically. An existing database created with `db push` or manual SQL may have no Prisma migration history. Prisma will stop with P3005 instead of overwriting it. Back it up and verify its schema against the migration SQL before baselining. For a database matching the initial migration, mark only that migration as applied using Prisma's `migrate resolve --applied 202610200000_initial` with the correct DATABASE_URL. If the inventory/procedure migrations were already run manually, verify and resolve those as well. Do not mark migrations applied unless their changes already exist. No automatic baselining or reset is performed.

## Optional seed

Automatic startup creates the database and tables; it does not insert sample users or data. The existing seed is optional and contains development passwords. To run it with configured DB_* settings inside the container:

```sh
docker compose exec app npm run seed
```

## Checks

`docker compose config --quiet` validates Compose without printing credentials. `docker compose down` stops the app and does not delete data on the external MySQL server.

## CORS origins

Set `CORS_ORIGINS` in `.env` to a comma-separated list, for example `https://hospital.example.com,http://192.168.1.20:3000`. Origins must include the scheme and optional port, with no path or trailing slash. Only listed origins receive API CORS headers; credentialed requests are supported. Wildcards are not supported. An empty setting grants no cross-origin browser access. Same-origin and server-to-server requests continue to work. CORS does not replace authentication. After changing `.env`, run `docker compose up -d --force-recreate app` (use `--build` when deploying this code change).

## Demonstrating patients

Run `docker compose exec app npm run seed` to create the default demo accounts plus 10 fictional pets and 6 fictional owners. Sign in with `admin@hospital.com` / `admin123`, then open `/dashboard/patients`. Alternatively, an administrator can use **Load demo patients** and confirm in the page. Demo records use stable IDs; repeating the seed preserves edits and does not duplicate records. Clinical examples are added when an active veterinarian exists. Demo loading is optional and never runs automatically on startup.

Try searching Luna, filtering to cats, viewing history, changing a weight or owner, and registering a new patient. Remove a patient with no care records to demonstrate deletion; patients with clinical records are protected. Fictional records have a Demo badge and example.invalid email addresses.
