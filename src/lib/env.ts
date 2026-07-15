import { z } from "zod";
import {
  getSiteUrl,
  getSupabaseAnonKey,
  getSupabaseUrl,
} from "@/lib/public-env";

const basePublicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

const productionPublicEnvSchema = basePublicEnvSchema.extend({
  NEXT_PUBLIC_SITE_URL: z.string().url({
    message: "NEXT_PUBLIC_SITE_URL is required in production",
  }),
});

export type PublicEnv = z.infer<typeof basePublicEnvSchema>;

let validatedPublicEnv: PublicEnv | null = null;

export function validatePublicEnv(): PublicEnv {
  if (validatedPublicEnv) return validatedPublicEnv;

  const isProduction = import.meta.env.PROD;
  const schema = isProduction ? productionPublicEnvSchema : basePublicEnvSchema;

  const result = schema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: getSupabaseUrl(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: getSupabaseAnonKey(),
    NEXT_PUBLIC_SITE_URL: getSiteUrl(),
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
  return import.meta.env.MODE;
}

export function isProduction(): boolean {
  return import.meta.env.PROD;
}
