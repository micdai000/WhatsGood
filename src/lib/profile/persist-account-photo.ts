import { logger } from "@/lib/logger";
import { authService } from "@/services/auth/auth.service";
import { businessService } from "@/services/businesses";
import { isFailure } from "@/types";

export async function persistAccountPhoto(input: {
  url: string | null;
  businessId?: string | null;
}): Promise<void> {
  if (input.businessId) {
    const businessResult = await businessService.updateBusiness(input.businessId, {
      logoUrl: input.url,
    });

    if (isFailure(businessResult)) {
      throw new Error(businessResult.error.message);
    }
  }

  const metadataResult = await authService.updateUserMetadata({
    avatar_url: input.url ?? "",
  });

  if (isFailure(metadataResult)) {
    logger.warn("persistAccountPhoto: skipped account metadata update", {
      message: metadataResult.error.message,
    });

    if (!input.businessId) {
      throw new Error("We couldn't save that photo. Please try again.");
    }
  }
}
