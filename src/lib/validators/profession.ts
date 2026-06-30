import { z } from "zod";

export const professionIdSchema = z.object({
  id: z.string().uuid("Invalid profession ID"),
});

export const professionSlugSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});
