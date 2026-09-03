import { PrismaClient } from "@prisma/client";

// Lazy singleton: the client is created on first use.
// This keeps route modules and tests that do not touch
// the database free of database side effects.

let client: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (!client) {
    client = new PrismaClient();
  }

  return client;
}

// Backward-compatible export for tests and modules
// that import `prisma` directly.
export const prisma = new Proxy(
  {} as PrismaClient,
  {
    get(_target, property) {
      const clientInstance = getPrisma();

      return Reflect.get(
        clientInstance,
        property,
        clientInstance
      );
    },
  }
);