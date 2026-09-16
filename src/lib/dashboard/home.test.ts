import { describe, expect, it } from "vitest";
import {
  formatDashboardReputation,
  getDashboardNextAction,
} from "@/lib/dashboard/home";

describe("minimal dashboard copy", () => {
  it("shows Building when a business has no feedback yet", () => {
    expect(formatDashboardReputation("gold", 0)).toBe("Building");
    expect(formatDashboardReputation("building", 0)).toBe("Building");
  });

  it("shows the current tier once feedback exists", () => {
    expect(formatDashboardReputation("gold", 24)).toBe("Gold");
    expect(formatDashboardReputation("building", 3)).toBe("Building");
  });

  it("asks new businesses to put the QR in front of customers", () => {
    expect(getDashboardNextAction(0)).toEqual({
      title: "Get more feedback",
      description: "Put your Meritt QR code where customers can see it.",
    });
  });

  it("asks businesses with feedback to keep the QR available", () => {
    expect(getDashboardNextAction(24)).toEqual({
      title: "Keep your reputation current",
      description: "Keep your QR code available to customers.",
    });
  });
});
