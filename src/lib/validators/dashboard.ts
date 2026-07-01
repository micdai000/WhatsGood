import { z } from "zod";
import { profileIdSchema } from "./profile";

export const dashboardProfileIdSchema = profileIdSchema;

export const dashboardTrendWeeksSchema = z.object({
  weeks: z.coerce.number().int().min(4).max(12).optional().default(8),
});

export type DashboardProfileIdSchema = z.infer<typeof dashboardProfileIdSchema>;
