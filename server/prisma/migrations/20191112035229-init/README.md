# Migration `20191112035229-init`

This migration has been generated at 11/12/2019, 3:52:29 AM.
You can check out the [state of the datamodel](./datamodel.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."Container" (
  "createdAt" timestamp(3) NOT NULL DEFAULT '1970-01-01 00:00:00' ,
  "id" text NOT NULL  ,
  "referenceID" text NOT NULL DEFAULT '' ,
  "slug" text NOT NULL DEFAULT '' ,
  "updatedAt" timestamp(3) NOT NULL DEFAULT '1970-01-01 00:00:00' ,
  PRIMARY KEY ("id")
);

CREATE TABLE "public"."User" (
  "createdAt" timestamp(3) NOT NULL DEFAULT '1970-01-01 00:00:00' ,
  "id" text NOT NULL  ,
  "name" text NOT NULL DEFAULT '' ,
  "updatedAt" timestamp(3) NOT NULL DEFAULT '1970-01-01 00:00:00' ,
  PRIMARY KEY ("id")
);

ALTER TABLE "public"."Container" ADD COLUMN "user" text   REFERENCES "public"."User"("id") ON DELETE SET NULL;

CREATE UNIQUE INDEX "Container.referenceID" ON "public"."Container"("referenceID")

CREATE UNIQUE INDEX "User.name" ON "public"."User"("name")
```

## Changes

```diff
diff --git datamodel.mdl datamodel.mdl
migration ..20191112035229-init
--- datamodel.dml
+++ datamodel.dml
@@ -1,0 +1,25 @@
+datasource db {
+  provider = env("PRISMA_DB_PROVIDER")
+  url      = env("PRISMA_DB_URL")
+}
+
+generator photon {
+  provider = "photonjs"
+}
+
+model Container {
+  id          String   @default(cuid()) @id
+  createdAt   DateTime @default(now())
+  updatedAt   DateTime @updatedAt
+  referenceID String   @unique
+  slug        String
+  user        User
+}
+
+model User {
+  id         String      @default(cuid()) @id
+  createdAt  DateTime    @default(now())
+  updatedAt  DateTime    @updatedAt
+  name       String      @unique
+  containers Container[]
+}
```

## Photon Usage

You can use a specific Photon built for this migration (20191112035229-init)
in your `before` or `after` migration script like this:

```ts
import Photon from '@generated/photon/20191112035229-init'

const photon = new Photon()

async function main() {
  const result = await photon.users()
  console.dir(result, { depth: null })
}

main()

```
