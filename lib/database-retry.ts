import { Prisma } from "@prisma/client";

const retryableCodes = new Set(["P1001", "P1002", "P2024"]);

export function isDatabaseUnavailable(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return retryableCodes.has(error.code);
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  return error instanceof Error && /can't reach database|connection pool|timed out/i.test(error.message);
}

export async function withDatabaseRetry<T>(operation: () => Promise<T>, attempts = 2): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isDatabaseUnavailable(error) || attempt === attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 350));
    }
  }

  throw lastError;
}
