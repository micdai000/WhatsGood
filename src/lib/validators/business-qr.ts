import { z } from "zod";

export const createQrCodeSchema = z.object({
  businessId: z.string().uuid("Invalid business ID"),
  locationId: z.string().uuid("Invalid location ID").nullable().optional(),
  label: z.string().trim().max(200).nullable().optional(),
});

export const updateQrCodeSchema = z.object({
  label: z.string().trim().max(200).nullable().optional(),
  isActive: z.boolean().optional(),
  locationId: z.string().uuid("Invalid location ID").nullable().optional(),
});

export const qrCodeIdSchema = z.object({
  id: z.string().uuid("Invalid QR code ID"),
});

export const qrCodeLookupSchema = z.object({
  code: z.string().trim().min(1, "QR code is required").max(64),
});

export const qrCodesByBusinessSchema = z.object({
  businessId: z.string().uuid("Invalid business ID"),
});

export type CreateQrCodeSchema = z.infer<typeof createQrCodeSchema>;
export type UpdateQrCodeSchema = z.infer<typeof updateQrCodeSchema>;
