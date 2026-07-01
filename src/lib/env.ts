import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

let validatedPublicEnv: PublicEnv | null = null;

/**
 * Validates required public environment variables.
 * Called from instrumentation during production builds/startup.
 */
export function validatePublicEnv(): PublicEnv {
  if (validatedPublicEnv) return validatedPublicEnv;

  const result = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });

  if (!result.success) {
    const missing = result.error.issues
      .map((issue) => issue.path.join("."))
      .join(", ");
    throw new Error(
      `Missing or invalid environment variables: ${missing}. See .env.example.`,
    );
  }

  validatedPublicEnv = result.data;
  return validatedPublicEnv;
}

export function getNodeEnv(): string {
  return serverEnvSchema.parse({ NODE_ENV: process.env.NODE_ENV }).NODE_ENV;
}

export function isProduction(): boolean {
  return getNodeEnv() === "production";
}
