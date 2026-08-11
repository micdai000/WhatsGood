import { describe, expect, it } from "vitest";
import {
  CURRENT_REPUTATION_LABEL,
  RECENT_CLIENT_FEEDBACK,
  REQUEST_CLIENT_FEEDBACK,
  VERIFIED_CLIENT_FEEDBACK,
} from "@/lib/copy/vocabulary";

describe("product vocabulary", () => {
  it("uses reputation-first labels", () => {
    expect(CURRENT_REPUTATION_LABEL).toBe("Current reputation");
    expect(VERIFIED_CLIENT_FEEDBACK).toBe("Verified client feedback");
    expect(RECENT_CLIENT_FEEDBACK).toBe("Recent client feedback");
    expect(REQUEST_CLIENT_FEEDBACK).toBe("Request client feedback");
  });

  it("avoids star-rating phrasing in core labels", () => {
    const blocklist = ["star rating", "average rating", "trust vote", "highly rated"];
    const labels = [CURRENT_REPUTATION_LABEL, VERIFIED_CLIENT_FEEDBACK, REQUEST_CLIENT_FEEDBACK];

    for (const label of labels) {
      for (const term of blocklist) {
        expect(label.toLowerCase()).not.toContain(term);
      }
    }
  });
});
